// Number formatting
export function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('en-US').format(num)
}

// Currency formatting (Nigerian Naira)
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₦0'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Percentage formatting
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined) return '0%'
  return `${Number(value).toFixed(decimals)}%`
}

// Time ago formatting
export function formatTimeAgo(date) {
  if (!date) return 'N/A'
  
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now - then) / 1000)
  
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`
  
  return formatDate(date)
}

// Date formatting
export function formatDate(date, format = 'short') {
  if (!date) return 'N/A'
  
  const d = new Date(date)
  
  if (format === 'short') {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  if (format === 'time') {
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  if (format === 'datetime') {
    return `${formatDate(date, 'short')} ${formatDate(date, 'time')}`
  }
  
  return d.toLocaleDateString()
}

// Duration formatting (minutes to human readable)
export function formatDuration(minutes) {
  if (!minutes || minutes < 0) return '0m'
  
  if (minutes < 60) return `${Math.round(minutes)}m`
  
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  
  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  
  if (remainingHours > 0) {
    return `${days}d ${remainingHours}h`
  }
  
  return `${days}d`
}

// File size formatting
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Severity color helper
export function getSeverityColor(severity) {
  switch (severity) {
    case 'critical':
      return 'bg-red-500'
    case 'high':
      return 'bg-orange-500'
    case 'medium':
      return 'bg-amber-500'
    case 'low':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
  }
}

// Status color helper
export function getStatusColor(status) {
  switch (status) {
    case 'operational':
    case 'completed':
    case 'resolved':
    case 'available':
      return 'text-green-600 dark:text-green-400'
    case 'maintenance':
    case 'in_progress':
    case 'on_call':
      return 'text-amber-600 dark:text-amber-400'
    case 'offline':
    case 'failed':
    case 'busy':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

// Truncate text
export function truncate(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

// Capitalize first letter
export function capitalize(text) {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Convert snake_case to Title Case
export function toTitleCase(text) {
  if (!text) return ''
  return text
    .split('_')
    .map(word => capitalize(word))
    .join(' ')
}

// Calculate percentage
export function calculatePercentage(value, total) {
  if (!total || total === 0) return 0
  return ((value / total) * 100).toFixed(1)
}

// Get health status text
export function getHealthStatus(health) {
  if (health >= 90) return 'Excellent'
  if (health >= 75) return 'Good'
  if (health >= 50) return 'Fair'
  if (health >= 25) return 'Poor'
  return 'Critical'
}

// Format phone number
export function formatPhoneNumber(phone) {
  if (!phone) return ''
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format as Nigerian number
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }
  
  return phone
}

// Get initials from name
export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Format coordinate
export function formatCoordinate(lat, lng) {
  if (!lat || !lng) return 'N/A'
  return `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`
}

// Get time of day greeting
export function getGreeting() {
  const hour = new Date().getHours()
  
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return distance.toFixed(1) // Return in km with 1 decimal
}

function toRad(degrees) {
  return degrees * (Math.PI / 180)
}