import OperableListItem, { OperableListItemProps } from '@/common/OperableListItem'
import { FC } from 'react'
import { isEmpty } from 'lodash'
import './index.scss'

export interface OperationListProps extends Partial<HTMLDivElement> {
  dataSource?: OperableListItemProps[]
}
const baseCls = 'operable-list'
const Content: FC<OperationListProps> = (props) => {
  const { className, dataSource } = props
  return (<div className={className ? `${baseCls} ${className}` : baseCls} hidden={isEmpty(dataSource)}>
    {dataSource?.map((item, index) => (
      <OperableListItem key={index} {...item} className={`${className}-item`} />
    ))}
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export default Content