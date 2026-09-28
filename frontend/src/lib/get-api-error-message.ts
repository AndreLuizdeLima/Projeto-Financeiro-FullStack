import axios from 'axios'

function getApiErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return 'Não foi possível concluir a operação. Tente novamente.'
  }

  const { message } = error.response?.data ?? {}

  if (typeof message === 'string') {
    return message
  }

  if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
    return message.join(' ')
  }

  return 'Não foi possível concluir a operação. Tente novamente.'
}

export { getApiErrorMessage }
