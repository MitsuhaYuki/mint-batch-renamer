import { ControlButton, ControlButtonProps } from '@/components/ControlButton'
import { FC, ReactNode, useMemo } from 'react'
import './index.scss'

interface IProps extends Partial<HTMLDivElement> {
  content: string | ReactNode
  operations: ControlButtonProps[]
}
const baseCls = 'operable-list-item'
const Content: FC<IProps> = (props) => {
  const { content, operations, title } = props

  const renderContent = useMemo(() => (
    <div className={`${baseCls}-content`} title={
      title ? title : typeof content === 'string' ? content : undefined
    }>{content}</div>
  ), [content])

  const renderButtons = useMemo(() => (
    <div className={`${baseCls}-btns`}>
      {operations.map((item, index) => (
        <ControlButton key={index} {...item} />
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
export {
  Content as OperableListItem
}
export type {
  IProps as OperableListItemProps
}