import { Button, Drawer, Modal, Space, Tabs, TabsProps, message } from 'antd'
import { CloseOutlined, PlusOutlined, ReloadOutlined, SaveFilled } from '@ant-design/icons'
import { IGlobalSetter } from '@/utils/hooks/useGlobalData'
import { IGlobalState } from '@/context/global'
import { ScriptBrowserItem } from './Item'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { ScriptEditor, ScriptEditorRef } from '../ScriptEditor'
import './index.scss'
import { IExtFilter, IExtFilterRaw } from '@/types/filter'
import { useDebounceFn, useThrottleFn, useUpdateEffect } from 'ahooks'
import { invoke } from '@tauri-apps/api/tauri'
import { ILogger } from '@/utils/logger'
import { loadScript } from '@/utils/extension'

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
  const [visible, setVisible] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>('0')
  const [currentScript, setCurrentScript] = useState<IExtFilter>()
  const [currentScriptType, setCurrentScriptType] = useState<'filter' | 'renamer'>('filter')
  const [isModified, setIsModified] = useState<boolean>(false)
  const scriptEditorRef = useRef<ScriptEditorRef>(null)
  const unwarppedGlobalSetter = (action: { type: string, payload: string }) => setGlobalData(action.payload as any)

  useImperativeHandle(ref, () => ({
    toggle: toggleSelfVisible
  }))

  const toggleSelfVisible = (visible?: boolean) => {
    setVisible(s => visible ?? !s)
  }

  const items: TabsProps['items'] = useMemo(() => {
    const tabs = []
    if (globalData.config.allow_external_filters) {
      tabs.push({
        key: '0',
        label: 'External Filters',
        children: null
      })
    }
    if (globalData.config.allow_external_renamers) {
      tabs.push({
        key: '1',
        label: 'External Renamers',
        children: null
      })
    }
    return tabs
  }, [globalData.config])

  const updateScriptConfig = (script: IExtFilter, scriptType: 'filter' | 'renamer') => {
    setIsModified(true)
    switch (scriptType) {
      case 'filter': {
        setGlobalData({ 'sysFiltersExt': { ...globalData.sysFiltersExt, [script.id]: script } })
      }
    }
  }

  const reloadScripts = () => {
    loadScript('filter', logger, (unwarppedGlobalSetter as any))
    setIsModified(false)
  }

  const saveScript = async () => {
    const transformedFilters = Object.keys(globalData.sysFiltersExt).reduce((prev, key) => {
      const itemCopy: any = { ...globalData.sysFiltersExt[key] }
      itemCopy.func = btoa(itemCopy.func?.toString())
      globalData.sysFiltersExt[key].modified = false
      delete itemCopy.error
      delete itemCopy.modified
      prev[key] = itemCopy
      return prev
    }, {} as Record<string, IExtFilterRaw>)
    const filtersText = JSON.stringify(transformedFilters, null, 2)
    try {
      await invoke('write_file', { filePath: 'ext_filter.json', content: filtersText })
      toggleSelfVisible(false)
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
        title: 'Close drawer?',
        content: '确定要重新加载所有脚本吗? 此操作将会丢失所有未保存的变更!',
        onOk: () => {
          toggleSelfVisible(false)
          reloadScripts()
        }
      })
    } else {
      toggleSelfVisible(false)
      reloadScripts()
    }
  }

  const renderTabs = useMemo(() => {
    switch (activeTab) {
      case '0': {
        const scripts = globalData.sysFiltersExt
        return (
          <div className={`${baseCls}-tabs-content`}>
            {Object.keys(scripts).map((key: string, index: number) => (
              <ScriptBrowserItem
                key={index}
                script={scripts[key]}
                scriptType='filter'
                onEdit={(script, scriptType) => {
                  setCurrentScript(script)
                  setCurrentScriptType(scriptType)
                  scriptEditorRef.current?.toggle(true)
                }}
              />
            ))}
            <div className={`${baseCls}-item add-script`}>
              <Button type='text' icon={<PlusOutlined />}>添加新脚本</Button>
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
      title={'Script Browser'}
      placement="right"
      width='100vw'
      className={baseCls}
      open={visible}
      closable={false}
      extra={<Space>
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
      onClose={() => toggleSelfVisible(false)}
    >
      <div className={`${baseCls}-body`}>
        <div className={`${baseCls}-tabs`}>
          <Tabs
            activeKey={activeTab}
            destroyInactiveTabPane
            items={items}
            tabBarGutter={0}
            tabPosition='left'
            onChange={e => setActiveTab(e)}
          />
        </div>
        <div className={`${baseCls}-content`}>
          {renderTabs}
        </div>
      </div>
      <ScriptEditor ref={scriptEditorRef} script={currentScript} scriptType={currentScriptType} onOk={updateScriptConfig} />
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