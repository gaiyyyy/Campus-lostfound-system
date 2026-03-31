import axios from './axios'

export const updateUsername = (newUsername) => {
  return axios.put('/api/user/update-username', { newUsername })
}

export const updatePassword = (oldPassword, newPassword) => {
  return axios.put('/api/user/update-password', { oldPassword, newPassword })
}

export default {
  updateUsername,
  updatePassword
}
