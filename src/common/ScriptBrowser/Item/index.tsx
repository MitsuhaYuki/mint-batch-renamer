import { FC } from 'react'
import { IExtFilter } from '@/types/filter'
import { Button } from 'antd'

type ContentProps = {
  filter: IExtFilter
}
const baseCls = 'script-browser-item'
const Content: FC<ContentProps> = (props) => {
  const { filter } = props
  return (
    <div className={baseCls}>
      <div className={`${baseCls}-main`}>
        <div className={`${baseCls}-main-title`}>{filter.label} ({filter.id})</div>
        <div className={`${baseCls}-main-desc`}>{filter.desc ?? '---未提供描述---'}</div>
      </div>
      <div className={`${baseCls}-btns`}>
        <Button size='small'>Install</Button>
      </div>
    </div>
  )
}

Content.defaultProps = {}
Content.displayName = baseCls
export {
  Content as ScriptBrowserItem
}
export type {
  ContentProps as ScriptBrowserItemProps
}
