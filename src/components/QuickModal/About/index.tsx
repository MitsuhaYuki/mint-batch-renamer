import { Flex } from 'antd'
import { MultiLangProps } from '@/types/mlang'
import { QuickModal, QuickModalRef } from '../Base'
import { ReactNode, forwardRef, useContext, useState } from 'react'
import { getVersion, getTauriVersion } from '@tauri-apps/api/app'
import { useMount } from 'ahooks'
import { useMultiLang } from '@/utils/mlang'
import { ConfigContext } from '@/context/config'
import './index.scss'

interface IProps extends MultiLangProps {}

const baseCls = 'modal-about'
const Content = forwardRef<QuickModalRef, IProps>((props, ref) => {
  const { state, dispatch } = useContext(ConfigContext)
  const { fmlText } = useMultiLang(state, baseCls, props.inheritName)

  const [data, setData] = useState<{
    version: string,
    tauriVersion: string
  }>({
    version: 'N/A',
    tauriVersion: 'N/A'
  })

  const updateInfo = async () => {
    const version = await getVersion()
    const tauriVersion = await getTauriVersion()
    setData({
      version,
      tauriVersion
    })
  }

  useMount(() => updateInfo())

  const renderInfo = (title: string, content: ReactNode) => {
    return <Flex className={`${baseCls}-desc`} gap='4px'>
      <div className={`${baseCls}-desc-title`}>{title} :&nbsp;</div>
      <div>{content}</div>
    </Flex>
  }

  return (<QuickModal
    classNames={{ body: `${baseCls}-body` }}
    title={fmlText('title')}
    ref={ref}
    footer={null}
  >
    <Flex vertical gap='4px'>
      {renderInfo(fmlText('app_ver'), data.version)}
      {renderInfo(fmlText('tauri_ver'), data.tauriVersion)}
      {renderInfo(fmlText('author'), <>M. (<a href='https://github.com/MitsuhaYuki/mint-batch-renamer' target='_blank'>GitHub Repo.</a>)</>)}
      {renderInfo(fmlText('font_name'), <>霞鹜文楷 轻便版 (<a href='https://github.com/lxgw/LxgwWenKai-Lite' target='_blank'>LXGW WenKai Lite</a>)</>)}
    </Flex>
  </QuickModal>)
})

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as AboutModal }
export type { IProps as AboutModalProps }