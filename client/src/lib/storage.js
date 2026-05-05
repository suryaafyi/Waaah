export const storage = {
  getBaby: () => {
    const raw = localStorage.getItem('waaah_baby')
    return raw ? JSON.parse(raw) : null
  },
  setBaby: (profile) => {
    localStorage.setItem('waaah_baby', JSON.stringify(profile))
  },
  getDeviceId: () => {
    let id = localStorage.getItem('waaah_device_id')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('waaah_device_id', id)
    }
    return id
  },
  clear: () => localStorage.clear(),
}
