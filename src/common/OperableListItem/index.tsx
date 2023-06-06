import { FC, ReactNode, useMemo } from 'react'
import { Button, ButtonProps } from 'antd'
import './index.scss'

export interface OperableListItemProps extends Partial<HTMLDivElement> {
  content: string | ReactNode
  operations: Omit<ButtonProps, 'size' | 'type'>[]
}
const baseCls = 'operable-list-item'
const Content: FC<OperableListItemProps> = (props) => {
  const { content, operations, title } = props

  const renderContent = useMemo(() => (
    <div className={`${baseCls}-content`} title={
      title ? title : typeof content === 'string' ? content : undefined
    }>{content}</div>
  ), [content])

  const renderButtons = useMemo(() => (
    <div className={`${baseCls}-btns`}>
      {operations.map((item, index) => (
        <Button key={index} size='small' type='text' {...item} />
      ))}
    </div>
  ), [operations])

  return (<div className={baseCls}>
    {renderContent}
    {renderButtons}
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export default Content