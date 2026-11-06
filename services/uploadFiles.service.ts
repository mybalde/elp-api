import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import type { Documents } from "../generated/prisma/client"
import { prisma } from "../lib/prisma"
import { Command } from "ioredis"
import { randomUUID } from "node:crypto"

type uploadFiles = keyof Omit<Documents , 'createdAt' | 'updatedAt' | 'id_doc' | 'clientId' >
type uploadMultiple = uploadFiles[]

const s3Client = new S3Client({region: process.env.AWS_REGION!})

export const uploadSingleFileService = async(clientId: string, file: Express.Multer.File) => {
  const fieldname = file.fieldname as uploadFiles
  const unqiueKey = `documents/${clientId}/${fieldname}-${randomUUID()}`
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: unqiueKey,
    Body: file.buffer,
    ContentType: file.mimetype
  }))
  const existingDoc = await prisma.documents.findUnique({
    where: {clientId}
  })
  const oldKEy = existingDoc?.[fieldname]
  const data = { [fieldname] : unqiueKey} as Record<uploadFiles, string>
  try {
    //Mise à jour de la nouvelle clé ou création du document s'il n'existe pas
    await prisma.documents.upsert({
      where: {clientId},
      create: {
        clientId,
        ...data
      },
      update:{
        data
      }
    })
  } catch (error) {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: unqiueKey
    }))

    throw error
  }
  if(oldKEy){
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: oldKEy
    }))
  }
}

export const uploadMultipleFiles = async(clientId: string, files: {[fieldname: string] : Express.Multer.File[]}) => {
    const existingDoc = await prisma.documents.findUnique({
      where: {clientId}
    })
    
    for(const [key, value] of Object.entries(files)){
      const uniquekey = `documents/${clientId}/${key}-${randomUUID()}`
      const oldKey = existingDoc?.[key as uploadFiles];
      const file = value[0]

      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: uniquekey,
        Body: file!.buffer,
        ContentType: file!.mimetype
      }))

      const data = { [file!.fieldname]: uniquekey} as Record<uploadFiles, string>
      try {
        await prisma.documents.upsert({
          where: {clientId},
          create: {
            clientId,
            ...data
          },
          update: {
            data
          }
        })
      } catch (error) {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: uniquekey
        }))

        throw error
      }
      if(oldKey){
        await s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: oldKey
        }))
      }
    }

}