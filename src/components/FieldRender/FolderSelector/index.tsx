import { WithConfigProps, WithConsoleProps } from '@/types/common'
import { MultiLangProps } from '@/types/mlang'
import { useMultiLang } from '@/utils/mlang'
import { FC } from 'react'
import { open } from '@tauri-apps/api/dialog'
import { Button, Flex } from 'antd'
import { FolderOpenOutlined } from '@ant-design/icons'
import './index.scss'

interface IProps extends MultiLangProps, WithConsoleProps, WithConfigProps {
  value?: string,
  onChange?: (value: string) => void
}

const baseCls = 'folder-selector'
const Content: FC<IProps> = (props) => {
  const { config, con, value, onChange } = props
  const { logger } = con
  const { fmlName, fmlText } = useMultiLang(config.state, baseCls, props.inheritName)

  const fsOpenDialog = async (
    title?: string
  ): Promise<string | undefined> => {
    try {
      const selected = await open({ directory: true, title })
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

  const onSelectFolder = async () => {
    const res = await fsOpenDialog(fmlText('uim_source'))
    if (res) onChange?.(res)
  }

  return (<div className={baseCls}>
    <Flex className={`${baseCls}-main`} justify='space-between' gap='8px'>
      <Button
        icon={<FolderOpenOutlined />}
        onClick={() => onSelectFolder()}
      >{fmlText('select_path')}</Button>
      <div className={`${baseCls}-main-path`}>{value ? value : fmlText('no_path')}</div>
    </Flex>
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as FolderSelector }
export type { IProps as FolderSelectorProps }