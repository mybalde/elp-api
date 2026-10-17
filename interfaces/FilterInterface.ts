import type { filterType } from "../schema/user.schema"

export const filterFunction = (filter: filterType) => {
  const paramsFilter: any = {}
  if(typeof filter.name==="string"){
    paramsFilter.name = filter.name
  }
  if(typeof filter.activate==="boolean"){
    paramsFilter.activate = filter.activate
  }
  if(filter.createdAt instanceof Date){
    paramsFilter.createdAt = filter.createdAt
  }

  return paramsFilter
}