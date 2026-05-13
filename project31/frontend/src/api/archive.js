import request from '../utils/request'

export function getArchiveList(params) {
  return request({
    url: '/archive/list',
    method: 'get',
    params
  })
}

export function getArchivePage(params) {
  return request({
    url: '/archive/list',
    method: 'get',
    params
  })
}

export function getArchiveById(id) {
  return request({
    url: `/archive/${id}`,
    method: 'get'
  })
}

export function addArchive(data) {
  return request({
    url: '/archive',
    method: 'post',
    data
  })
}

export function createArchive(data) {
  return request({
    url: '/archive',
    method: 'post',
    data
  })
}

export function updateArchive(data) {
  return request({
    url: '/archive',
    method: 'put',
    data
  })
}

export function deleteArchive(id) {
  return request({
    url: `/archive/${id}`,
    method: 'delete'
  })
}

export function exportArchive() {
  return request({
    url: '/archive/export/excel',
    method: 'get'
  })
}

export function getArchiveArchivePage(params) {
  return request({
    url: '/archive/list',
    method: 'get',
    params
  })
}

export function applyArchiveArchive(data) {
  return request({
    url: '/archive',
    method: 'post',
    data
  })
}

export function approveArchiveArchive(data) {
  return request({
    url: '/archive',
    method: 'put',
    data
  })
}

export function getArchiveBorrowPage(params) {
  return request({
    url: '/archive/list',
    method: 'get',
    params
  })
}

export function getExpiringBorrows() {
  return request({
    url: '/archive/list',
    method: 'get'
  })
}

export function applyArchiveBorrow(data) {
  return request({
    url: '/archive',
    method: 'post',
    data
  })
}

export function approveArchiveBorrow(data) {
  return request({
    url: '/archive',
    method: 'put',
    data
  })
}

export function returnArchiveBorrow(id) {
  return request({
    url: `/archive/${id}`,
    method: 'put'
  })
}

export function getArchiveDestroyPage(params) {
  return request({
    url: '/archive/list',
    method: 'get',
    params
  })
}

export function applyArchiveDestroy(data) {
  return request({
    url: '/archive',
    method: 'post',
    data
  })
}

export function approveArchiveDestroy(data) {
  return request({
    url: '/archive',
    method: 'put',
    data
  })
}

export function executeArchiveDestroy(id) {
  return request({
    url: `/archive/${id}`,
    method: 'delete'
  })
}

export function getArchiveFiles(archiveId) {
  return request({
    url: `/archive/${archiveId}`,
    method: 'get'
  })
}

export function getArchiveFileUrl(archiveId, fileId) {
  return request({
    url: `/archive/${archiveId}`,
    method: 'get'
  })
}

export function getArchiveStatusHistory(archiveId) {
  return request({
    url: `/archive/${archiveId}`,
    method: 'get'
  })
}
