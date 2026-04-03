const USER_ID_KEY = 'padelbuddy_user_id'

export function getOrCreateUserId(): string {
  if (typeof localStorage === 'undefined') {
    return 'ssr'
  }
  const storedId = localStorage.getItem(USER_ID_KEY)
  if (storedId) {
    return storedId
  }

  const userId = crypto.randomUUID()
  localStorage.setItem(USER_ID_KEY, userId)
  return userId
}
