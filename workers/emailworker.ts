import { Worker, Queue } from "bullmq";
import { transporter } from "./mailer";
import IORedis from "ioredis"
import type { MyData, MyReturn } from "../types/workers.types";

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6375,
  maxRetriesPerRequest: null,
});
export const mailerQueue = new Queue('mailerQueue', {connection})
const emailWorker = new Worker<MyData, MyReturn>('mailerQueue', async job=>{
  const {to, subject, html} = job.data
  console.log(`Traitement de l'envoi de l'e-mail pour: ${to} (Job ID : ${job.id})`)

  try{
    const info = await transporter.sendMail({
      from: '"Elp finance" <no-reply>',
      to,
      subject,
      html
    })

    if (job.name === 'code-de-confirmation-email') {
      await job.remove();
    }
    return {success: true, messageId: info.messageId, message: "Job bien exécuté."}
  }catch(error){
    console.error(`Erreur lors de l'envoi de l'e-mail à ${to} :`, error);
    throw error;
  }

}, {
  connection,
  concurrency: 5,
  autorun: false,
  removeOnComplete: {
    age: 24*3600,
    count: 500,
    limit: 100,
  },
  removeOnFail: {
    age: 7*24*3600,
    count: 2000,
    limit: 1000
  }
})

emailWorker.run()

emailWorker.on('completed', (job) => {
  console.log(`Job ${job.id} terminé avec succès.`);
})

emailWorker.on('failed', (job, err) => {
  if(!job){
    console.log("Aucun job défini.")
  }else{
    console.error(`Job ${job.id} a échoué avec l'erreur : ${err.message}`);
  }
})

emailWorker.on('error', err => {
  console.error(err);
})