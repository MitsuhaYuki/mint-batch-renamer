import { FC, useMemo } from 'react'
import { IExtFilter } from '@/types/filter'
import { Button, Tag } from 'antd'
import { EScriptAction, EScriptType } from '@/types/extension'

type ContentProps = {
  script: IExtFilter
  scriptType: EScriptType
  onAction?: (script: IExtFilter, scriptType: EScriptType, actionType: EScriptAction) => void
}
const baseCls = 'script-browser-item'
const Content: FC<ContentProps> = (props) => {
  const { script, scriptType, onAction } = props

  const renderBadge = useMemo(() => {
    const status: React.ReactNode[] = []
    /**
     * About tag key:
     * c: created, de: deleted, di: disabled, e: error, m: modified
     * for 'de' and 'di', both of them starts with same letter 'd', so we use second letter to avoid key conflict
     * if still conflict, use third letter, and so on
     */
    if (script.status.created && !script.status.deleted) {
      status.push(<Tag key='c' bordered={false} color='success'>新创建</Tag>)
    }
    if (script.status.deleted) {
      status.push(<Tag key='de' bordered={false} color='error'>将删除</Tag>)
    }
    if (script.status.disabled) {
      status.push(<Tag key='di' bordered={false} color='default'>已禁用</Tag>)
    }
    if (script.status.error) {
      status.push(<Tag key='e' bordered={false} color='error'>错误</Tag>)
    }
    if (script.status.modified && !script.status.created) {
      status.push(<Tag key='m' bordered={false} color='warning'>已修改</Tag>)
    }
    return status
  }, [script])

  return (
    <div className={baseCls}>
      <div className={`${baseCls}-main`}>
        <div className={`${baseCls}-main-title`}>{renderBadge} <span className={`${script.status.disabled ? 'disabled' : 'enabled'}`}>{script.label} ({script.id})</span></div>
        <div className={`${baseCls}-main-desc`}>{script.desc ?? '---未提供描述---'}</div>
      </div>
      <div className={`${baseCls}-btns`}>
        <Button size='small' onClick={() => onAction?.(script, scriptType, EScriptAction.Update)}>编辑</Button>
        <Button
          size='small'
          onClick={() => onAction?.(script, scriptType, EScriptAction.Disable)}
        >{script.status.disabled ? '启用' : '禁用'}</Button>
        <Button
          size='small'
          onClick={() => onAction?.(script, scriptType, EScriptAction.Delete)}
        >{script.status.deleted ? '取消删除' : '删除'}</Button>
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
