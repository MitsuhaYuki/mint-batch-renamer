import { Button, Drawer, Tabs, TabsProps } from 'antd'
import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import { IGlobalSetter } from '@/utils/hooks/useGlobalData'
import { IGlobalState } from '@/context/global'
import { ScriptBrowserItem } from './Item'
import { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import './index.scss'

type ContentRef = {
  toggle: (visible?: boolean) => void
}

type ContentProps = {
  globalData: IGlobalState
  setGlobalData?: IGlobalSetter
}
const baseCls = 'script-browser'
const Content = forwardRef<ContentRef, ContentProps>((props, ref) => {
  const { globalData } = props
  const [visible, setVisible] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>('0')

  useImperativeHandle(ref, () => ({
    toggle: toggleSelfVisible
  }))

  const toggleSelfVisible = (visible?: boolean) => {
    setVisible(s => visible ?? !s)
  }

  const items: TabsProps['items'] = [
    {
      key: '0',
      label: 'External Filters',
      children: null
    },
    {
      key: '1',
      label: 'External Renamers',
      children: null
    },
  ]

  const renderTabs = useMemo(() => {
    switch (activeTab) {
      case '0': {
        const scripts = globalData.sysFiltersExt
        return (
          <div className={`${baseCls}-tabs-content`}>
            {Object.keys(scripts).map((key: string, index: number) => (
              <ScriptBrowserItem
                key={index}
                filter={scripts[key]}
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
  }, [globalData, activeTab])

  return (
    <Drawer
      title={'Script Browser'}
      placement="right"
      width='100vw'
      className={baseCls}
      open={visible}
      closable={false}
      extra={<Button
        type='text'
        size='small'
        icon={<CloseOutlined style={{ color: '#8c8c8c' }} title='Script Browser' />}
        onClick={() => setVisible(false)}
      />}
      onClose={() => setVisible(false)}
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
    </Drawer>
  )
})

Content.defaultProps = {}
Content.displayName = baseCls
export default Content
export type {
  ContentRef as ScriptBrowserRef,
  ContentProps as ScriptBrowserProps
}