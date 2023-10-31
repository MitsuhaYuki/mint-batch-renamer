import { Button, Flex } from 'antd'
import { DropInterceptor } from './interceptor'
import { FC, useRef } from 'react'
import { FolderOpenOutlined, InboxOutlined } from '@ant-design/icons'
import { MultiLangProps } from '@/types/mlang'
import { QuickModalRef } from '@/components/QuickModal/Base'
import { WithConfigProps, WithConsoleProps } from '@/types/common'
import { open } from '@tauri-apps/api/dialog'
import { useMultiLang } from '@/utils/mlang'
import './index.scss'

interface PathSelectorFilter {
  /** filter name */
  name: string,
  /** file extensions to filter */
  extensions: string[]
}

interface IProps extends MultiLangProps, WithConsoleProps, WithConfigProps {
  /** direcrory selector, false to use file selector */
  directory?: boolean,
  /** filters when use file selector mode */
  filters?: PathSelectorFilter[],
  /** multiple selection */
  multiple?: boolean,
  /** dialog title */
  title?: string,
  /** current value */
  value?: string,
  /** onChange handler */
  onChange?: (value: string) => void
}

const baseCls = 'field-path-selector'
const Content: FC<IProps> = (props) => {
  const { con, config, inheritName, value, onChange, ...dialogProps } = props
  const { logger } = con
  const { fmlName, fmlText } = useMultiLang(config.state, baseCls, inheritName)
  const interceptor = useRef<QuickModalRef>(null)

  const fsOpenDialog = async (): Promise<string | undefined> => {
    try {
      const selected = await open(dialogProps)
      if (selected !== null) {
        const res = Array.isArray(selected) ? selected[0] : selected
        logger.info(`Selected folder: ${res}`)
        return res
      } else {
        logger.info('Canceled select folder')
      }
    } catch (e) {
      logger.error(`Select folder failed: ${e}`)
    }
    return
  }

  const onSelect = async () => {
    const res = await fsOpenDialog()
    if (res) onChange?.(res)
  }

  return (<div className={baseCls}>
    <Flex className={`${baseCls}-main`} justify='space-between' gap='8px'>
      <Flex gap='4px'>
        <Button
          icon={<FolderOpenOutlined />}
          onClick={() => onSelect()}
        >{fmlText('fields:path_select')}</Button>
        <Button
          icon={<InboxOutlined />}
          title={fmlText('fields:path_drop_enable')}
          onClick={() => interceptor.current?.toggle(true)}
        />
      </Flex>
      <div className={`${baseCls}-main-path`}>{value ? value : fmlText('fields:path_empty')}</div>
    </Flex>
    <DropInterceptor
      ref={interceptor}
      tips={fmlText('fields:path_drop_tips')}
      onDrop={res => { if (res && res.length > 0) onChange?.(res[0]) }}
    />
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as PathSelector }
export type { IProps as PathSelectorProps }