import { FC } from 'react'
import { IExtFilter } from '@/types/filter'
import { Button } from 'antd'

type ContentProps = {
  script: IExtFilter
  scriptType: 'filter' | 'renamer'
  onEdit?: (script: IExtFilter, scriptType: 'filter' | 'renamer') => void
}
const baseCls = 'script-browser-item'
const Content: FC<ContentProps> = (props) => {
  const { script, scriptType, onEdit } = props
  return (
    <div className={baseCls}>
      <div className={`${baseCls}-main`}>
        <div className={`${baseCls}-main-title`}><span className={`${baseCls}-main-title-error`} hidden={!script.modified}>[有修改]</span> {script.label} ({script.id})</div>
        <div className={`${baseCls}-main-desc`}>{script.desc ?? '---未提供描述---'}</div>
      </div>
      <div className={`${baseCls}-btns`}>
        <Button size='small' onClick={() => onEdit?.(script, scriptType)}>编辑</Button>
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
