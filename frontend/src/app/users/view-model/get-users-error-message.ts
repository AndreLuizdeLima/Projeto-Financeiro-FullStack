import axios from 'axios'

const invalidEmailMessage = 'email must be an email'

function getUsersErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return 'Não foi possível concluir a operação. Tente novamente.'
  }

  const { message } = error.response?.data ?? {}
  const messages = Array.isArray(message) ? message : [message]

  if (messages.some((item) => item === invalidEmailMessage)) {
    return 'Informe um e-mail válido.'
  }

  if (typeof message === 'string') {
    return message
  }

  if (messages.every((item) => typeof item === 'string')) {
    return messages.join(' ')
  }

  return 'Não foi possível concluir a operação. Tente novamente.'
}

export { getUsersErrorMessage }
