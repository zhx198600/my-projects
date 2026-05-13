import request from '../utils/request'

export function getTicketPage(params) {
  return request({
    url: '/service/ticket/list',
    method: 'get',
    params
  })
}

export function getTicketList(params) {
  return request({
    url: '/service/ticket/list',
    method: 'get',
    params
  })
}

export function getTicketById(id) {
  return request({
    url: `/service/ticket/${id}`,
    method: 'get'
  })
}

export function createTicket(data) {
  return request({
    url: '/service/ticket',
    method: 'post',
    data
  })
}

export function updateTicket(data) {
  return request({
    url: '/service/ticket',
    method: 'put',
    data
  })
}

export function deleteTicket(id) {
  return request({
    url: `/service/ticket/${id}`,
    method: 'delete'
  })
}

export function assignTicket(data) {
  return request({
    url: '/service/ticket',
    method: 'put',
    data
  })
}

export function autoAssignTicket(ticketId) {
  return request({
    url: '/service/ticket',
    method: 'put',
    data: { ticketId }
  })
}

export function processTicket(data) {
  return request({
    url: '/service/ticket',
    method: 'put',
    data
  })
}

export function addTicketRemark(data) {
  return request({
    url: '/service/ticket',
    method: 'put',
    data
  })
}

export function evaluateTicket(data) {
  return request({
    url: '/service/ticket',
    method: 'put',
    data
  })
}

export function getTicketRecords(ticketId) {
  return request({
    url: `/service/ticket/${ticketId}`,
    method: 'get'
  })
}

export function exportTicketExcel() {
  return request({
    url: '/service/ticket/export/excel',
    method: 'get'
  })
}

export function exportTicketPdf() {
  return request({
    url: '/service/ticket/export/excel',
    method: 'get'
  })
}

export function getTicketDetail(id) {
  return request({
    url: `/service/ticket/${id}`,
    method: 'get'
  })
}
