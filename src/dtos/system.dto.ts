export type LogRequestType = 'warning' | 'success' | 'error' | 'info'

export interface LogRequestDTO {
    type?: LogRequestType,
    label?: string,
    data: any,
}