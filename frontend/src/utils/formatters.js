import { format, formatDistanceToNow } from 'date-fns'

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₦0'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  return new Intl.NumberFormat('en-NG').format(num)
}

export const formatDate = (date) => {
  if (!date) return 'N/A'
  return format(new Date(date), 'MMM dd, yyyy')
}

export const formatDateTime = (date) => {
  if (!date) return 'N/A'
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

export const formatTimeAgo = (date) => {
  if (!date) return 'N/A'
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export const formatPercentage = (value) => {
  if (!value && value !== 0) return '0%'
  return `${Math.round(value)}%`
}

export const getStatusColor = (status) => {
  const colors = {
    operational: 'text-green-600 bg-green-50',
    maintenance: 'text-yellow-600 bg-yellow-50',
    offline: 'text-red-600 bg-red-50',
    online: 'text-green-600 bg-green-50',
  }
  return colors[status] || 'text-gray-600 bg-gray-50'
}

export const getHealthColor = (health) => {
  if (health >= 90) return 'text-green-600'
  if (health >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

export const getSeverityColor = (severity) => {
  const colors = {
    high: 'text-red-600 bg-red-50 border-red-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    low: 'text-blue-600 bg-blue-50 border-blue-200',
  }
  return colors[severity] || 'text-gray-600 bg-gray-50 border-gray-200'
}