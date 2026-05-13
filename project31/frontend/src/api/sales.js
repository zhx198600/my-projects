import request from '../utils/request'

export function getLeadPage(params) {
  return request({
    url: '/sales/lead/list',
    method: 'get',
    params
  })
}

export function getLeadList(params) {
  return request({
    url: '/sales/lead/list',
    method: 'get',
    params
  })
}

export function getLeadById(id) {
  return request({
    url: `/sales/lead/${id}`,
    method: 'get'
  })
}

export function addLead(data) {
  return request({
    url: '/sales/lead',
    method: 'post',
    data
  })
}

export function updateLead(data) {
  return request({
    url: '/sales/lead',
    method: 'put',
    data
  })
}

export function deleteLead(id) {
  return request({
    url: `/sales/lead/${id}`,
    method: 'delete'
  })
}

export function assignLead(data) {
  return request({
    url: '/sales/lead',
    method: 'put',
    data
  })
}

export function updateLeadStatus(data) {
  return request({
    url: '/sales/lead',
    method: 'put',
    data
  })
}

export function getLeadFollows(id) {
  return request({
    url: `/sales/lead/${id}`,
    method: 'get'
  })
}

export function addLeadFollow(data) {
  return request({
    url: '/sales/lead',
    method: 'post',
    data
  })
}

export function exportLeadExcel() {
  return request({
    url: '/sales/lead/export/excel',
    method: 'get'
  })
}

export function getOpportunityPage(params) {
  return request({
    url: '/sales/opportunity/list',
    method: 'get',
    params
  })
}

export function getOpportunityList(params) {
  return request({
    url: '/sales/opportunity/list',
    method: 'get',
    params
  })
}

export function getOpportunityById(id) {
  return request({
    url: `/sales/opportunity/${id}`,
    method: 'get'
  })
}

export function addOpportunity(data) {
  return request({
    url: '/sales/opportunity',
    method: 'post',
    data
  })
}

export function updateOpportunity(data) {
  return request({
    url: '/sales/opportunity',
    method: 'put',
    data
  })
}

export function deleteOpportunity(id) {
  return request({
    url: `/sales/opportunity/${id}`,
    method: 'delete'
  })
}

export function convertLead(data) {
  return request({
    url: '/sales/opportunity',
    method: 'post',
    data
  })
}

export function updateStage(data) {
  return request({
    url: '/sales/opportunity',
    method: 'put',
    data
  })
}

export function getStageHistory(id) {
  return request({
    url: `/sales/opportunity/${id}`,
    method: 'get'
  })
}

export function getContractPage(params) {
  return request({
    url: '/sales/contract/list',
    method: 'get',
    params
  })
}

export function getContractList(params) {
  return request({
    url: '/sales/contract/list',
    method: 'get',
    params
  })
}

export function getContractById(id) {
  return request({
    url: `/sales/contract/${id}`,
    method: 'get'
  })
}

export function addContract(data) {
  return request({
    url: '/sales/contract',
    method: 'post',
    data
  })
}

export function updateContract(data) {
  return request({
    url: '/sales/contract',
    method: 'put',
    data
  })
}

export function deleteContract(id) {
  return request({
    url: `/sales/contract/${id}`,
    method: 'delete'
  })
}

export function auditContract(data) {
  return request({
    url: '/sales/contract',
    method: 'put',
    data
  })
}

export function getCommissionRulePage(params) {
  return request({
    url: '/sales/commission/list',
    method: 'get',
    params
  })
}

export function getCommissionRuleList(params) {
  return request({
    url: '/sales/commission/list',
    method: 'get',
    params
  })
}

export function addCommissionRule(data) {
  return request({
    url: '/sales/commission',
    method: 'post',
    data
  })
}

export function updateCommissionRule(data) {
  return request({
    url: '/sales/commission',
    method: 'put',
    data
  })
}

export function deleteCommissionRule(id) {
  return request({
    url: `/sales/commission/${id}`,
    method: 'delete'
  })
}

export function calculateCommission(data) {
  return request({
    url: '/sales/commission',
    method: 'post',
    data
  })
}

export function getSettlementPage(params) {
  return request({
    url: '/sales/commission/list',
    method: 'get',
    params
  })
}

export function createSettlement(contractId) {
  return request({
    url: '/sales/commission',
    method: 'post',
    data: { contractId }
  })
}

export function settleCommission(id) {
  return request({
    url: `/sales/commission/${id}`,
    method: 'put'
  })
}

export function exportSettlementExcel() {
  return request({
    url: '/sales/lead/export/excel',
    method: 'get'
  })
}

export function updateOpportunityStage(data) {
  return request({
    url: '/sales/opportunity',
    method: 'put',
    data
  })
}

export function getOpportunityHistory(id) {
  return request({
    url: `/sales/opportunity/${id}`,
    method: 'get'
  })
}

export function exportOpportunityExcel() {
  return request({
    url: '/sales/lead/export/excel',
    method: 'get'
  })
}

export function exportContractExcel() {
  return request({
    url: '/sales/lead/export/excel',
    method: 'get'
  })
}

export function getSettlementList(params) {
  return request({
    url: '/sales/commission/list',
    method: 'get',
    params
  })
}

export function saveCommissionRule(data) {
  return request({
    url: '/sales/commission',
    method: 'post',
    data
  })
}
