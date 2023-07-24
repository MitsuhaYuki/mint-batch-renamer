import { Button, Drawer, Modal, Space, Tabs, TabsProps, message } from 'antd'
import { CloseOutlined, PlusOutlined, ReloadOutlined, SaveFilled } from '@ant-design/icons'
import { EScriptAction, EScriptType } from '@/types/extension'
import { IExtFilterInstance, IExtFilterRaw } from '@/types/filter'
import { IGlobalSetter } from '@/utils/hooks/useGlobalData'
import { IGlobalState } from '@/context/global'
import { ILogger } from '@/utils/logger'
import { ScriptBrowserItem } from './Item'
import { ScriptEditor, ScriptEditorRef } from '../ScriptEditor'
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { loadScript } from '@/utils/extension'
import { useThrottleFn } from 'ahooks'
import './index.scss'

type ContentRef = {
  toggle: (visible?: boolean) => void
}

type ContentProps = {
  logger: ILogger
  globalData: IGlobalState
  setGlobalData: IGlobalSetter
}

const baseCls = 'script-browser'
const Content = forwardRef<ContentRef, ContentProps>((props, ref) => {
  const { logger, globalData, setGlobalData } = props
  /** is drawer visible */
  const [visible, setVisible] = useState<boolean>(false)
  /** current active tab & current active script type */
  const [activeTab, setActiveTab] = useState<EScriptType>(EScriptType.Filter)
  /** current modifing script */
  const [currentScript, setCurrentScript] = useState<IExtFilterInstance>()
  /** control if save changes button visible */
  const [isModified, setIsModified] = useState<boolean>(false)
  /** external script editor instance */
  const scriptEditorRef = useRef<ScriptEditorRef>(null)
  /** restore wrapped globalData setter (for loadScript method) */
  const unwarppedGlobalSetter = (action: { type: string, payload: string }) => setGlobalData(action.payload as any)

  /** expose drawer toggle method */
  useImperativeHandle(ref, () => ({
    toggle: (visible?: boolean) => {
      setVisible(s => visible ?? !s)
    }
  }))

  /** script browser tabs */
  const tabs: TabsProps['items'] = useMemo(() => {
    const newTabs = []
    if (globalData.config.allow_external_filters) {
      newTabs.push({
        key: 'filter',
        label: '外部过滤器',
        children: null
      })
    }
    if (globalData.config.allow_external_renamers) {
      newTabs.push({
        key: 'renamer',
        label: '外部重命名器',
        children: null
      })
    }
    return newTabs
  }, [globalData.config])

  /** reload external scripts. */
  const reloadScripts = () => {
    loadScript(EScriptType.Filter, logger, (unwarppedGlobalSetter as any))
    setIsModified(false)
  }

  /**
   * Update system external scripts list.
   * @param script external script instance
   * @param scriptType script type
   * @param actionType action type
   */
  const updateScripts = (script: IExtFilterInstance, scriptType: EScriptType, actionType: EScriptAction) => {
    // script modify detection handled by ScriptEditor, so if this function is called, it means that the script must be modified
    const shadowScript = Object.assign({}, script)
    setIsModified(true)
    switch (actionType) {
      case EScriptAction.Create: {
        shadowScript['status'] = {
          created: true,
          deleted: false,
          disabled: false,
          error: false,
          modified: false,
        }
        break
      }
      case EScriptAction.Delete: {
        if (shadowScript.status.deleted) {
          shadowScript['status'] = {
            ...shadowScript['status'],
            deleted: false
          }
        } else {
          shadowScript['status'] = {
            ...shadowScript['status'],
            deleted: true
          }
        }
        break
      }
      case EScriptAction.Update: {
        if (!shadowScript.status?.created) {
          shadowScript['status'] = {
            ...shadowScript['status'],
            modified: true,
          }
        }
        break
      }
      case EScriptAction.Disable: {
        if (shadowScript.status.disabled) {
          shadowScript['status'] = {
            ...shadowScript['status'],
            disabled: false
          }
        } else {
          shadowScript['status'] = {
            ...shadowScript['status'],
            disabled: true
          }
        }
        break
      }
      default:
        logger.warn('sys script action not supported!')
        break
    }
    switch (scriptType) {
      case EScriptType.Filter: {
        setGlobalData({ 'sysFiltersExt': { ...globalData.sysFiltersExt, [shadowScript.id]: shadowScript } })
        break
      }
    }
  }

  const saveScript = async () => {
    const transformedFilters = Object.keys(globalData.sysFiltersExt).reduce((prev, key) => {
      if (!globalData.sysFiltersExt[key].status.deleted) {
        const itemCopy: any = Object.assign({}, globalData.sysFiltersExt[key])
        itemCopy.func = btoa(encodeURIComponent(itemCopy.func?.toString()))
        // reset script status
        itemCopy.status = {
          ...itemCopy.status,
          created: false,
          deleted: false,
          error: false,
          modified: false,
        }
        prev[key] = itemCopy
      }
      return prev
    }, {} as Record<string, IExtFilterRaw>)
    const filtersText = JSON.stringify(transformedFilters, null, 2)
    try {
      await invoke('write_file', { filePath: 'ext_filter.json', content: filtersText })
      setVisible(false)
    } catch (e) {
      message.error('写入文件失败!')
      logger.error(`Failed to write ext_filter.json, err=${e}`)
    } finally {
      reloadScripts()
    }
  }

  const saveScriptWithPrompt = () => {
    Modal.confirm({
      title: '保存所有修改?',
      content: '确定保存所有修改的脚本吗? 此操作无法撤销.',
      onOk: () => saveScript()
    })
  }

  const { run: reloadScriptWithPrompt } = useThrottleFn(() => {
    if (isModified) {
      Modal.confirm({
        title: '重新加载所有脚本?',
        content: '确定要重新加载所有脚本吗? 此操作将会丢失所有未保存的变更!',
        onOk: () => {
          reloadScripts()
          message.info('重新加载外部脚本...')
        }
      })
    } else {
      reloadScripts()
      message.info('重新加载外部脚本...')
    }
  }, { wait: 750, leading: true, trailing: false })

  const closeDrawerWithPrompt = () => {
    if (isModified) {
      Modal.confirm({
        title: '修改未保存',
        content: '确定要关闭脚本管理器? 此操作将会丢失所有未保存的变更!',
        onOk: () => {
          setVisible(false)
          reloadScripts()
        }
      })
    } else {
      setVisible(false)
      reloadScripts()
    }
  }

  const renderTabContents = useMemo(() => {
    switch (activeTab) {
      case EScriptType.Filter: {
        const scripts = globalData.sysFiltersExt
        return (
          <div className={`${baseCls}-tabs-content`}>
            {Object.keys(scripts).map((key: string, index: number) => (
              <ScriptBrowserItem
                key={index}
                script={scripts[key]}
                scriptType={activeTab}
                onAction={(script, scriptType, actionType) => {
                  switch (actionType) {
                    case EScriptAction.Delete:
                    case EScriptAction.Disable:
                      updateScripts(script, scriptType, actionType)
                      break
                    case EScriptAction.Update:
                      setCurrentScript(Object.assign({}, script))
                      scriptEditorRef.current?.toggle(true)
                      break
                  }
                }}
              />
            ))}
            <div className={`${baseCls}-item add-script`}>
              <Button
                type='text'
                icon={<PlusOutlined />}
                onClick={() => {
                  setCurrentScript(undefined)
                  scriptEditorRef.current?.toggle(true)
                }}
              >添加新脚本</Button>
            </div>
          </div>
        )
      }
      default:
        break
    }
  }, [globalData.sysFiltersExt, activeTab])

  return (
    <Drawer
      title={'脚本管理'}
      placement="right"
      width='100vw'
      height='100vh'
      className={baseCls}
      open={visible}
      closable={false}
      extra={<Space size={4}>
        <Button
          size='small'
          icon={<ReloadOutlined />}
          onClick={reloadScriptWithPrompt}
        >重新加载</Button>
        <Button
          type='primary'
          size='small'
          hidden={!isModified}
          icon={<SaveFilled />}
          onClick={saveScriptWithPrompt}
        >保存修改</Button>
        <Button
          type='text'
          size='small'
          icon={<CloseOutlined style={{ color: '#8c8c8c' }} />}
          onClick={closeDrawerWithPrompt}
        />
      </Space>}
      onClose={() => setVisible(false)}
    >
      <div className={`${baseCls}-body`}>
        <div className={`${baseCls}-tabs`}>
          <Tabs
            activeKey={activeTab}
            destroyInactiveTabPane
            items={tabs}
            tabBarGutter={0}
            tabPosition='left'
            // FIXME: warning! tab change should also clear modify state & reload script!
            onChange={e => setActiveTab(e as EScriptType)}
          />
        </div>
        <div className={`${baseCls}-content`}>
          {renderTabContents}
        </div>
      </div>
      <ScriptEditor ref={scriptEditorRef} script={currentScript} scriptType={activeTab} onOk={updateScripts} />
    </Drawer>
  )
})

Content.defaultProps = {}
Content.displayName = baseCls
export {
  Content as ScriptBrowser
}
export type {
  ContentRef as ScriptBrowserRef,
  ContentProps as ScriptBrowserProps
}