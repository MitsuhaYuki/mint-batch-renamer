import { Button, ButtonProps } from 'antd'
import { FC } from 'react'
import './index.scss'

interface IProps extends Omit<ButtonProps, 'type' | 'size'> {}

const baseCls = 'control-button'
const Content: FC<IProps> = (props) => {
  const { className } = props
  return (<Button
    className={className ? `${baseCls} ${className}` : baseCls}
    size='small'
    type='text'
    {...props}
  />)
}

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as ControlButton }
export type { IProps as ControlButtonProps }