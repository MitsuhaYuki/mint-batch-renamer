import { App, Button, Collapse, CollapseProps, Flex, Segmented } from 'antd'
import { CloseOutlined, DeleteOutlined, FolderOpenOutlined, MenuOutlined, ReloadOutlined } from '@ant-design/icons'
import { FC, useContext, useEffect, useState } from 'react'
import { FileItemExtend } from '@/types/file'
import { MultiLangProps } from '@/types/mlang'
import { SysUtilContext } from '@/context/sysutil'
import { invoke } from '@tauri-apps/api/tauri'
import { open } from '@tauri-apps/api/dialog'
import { useConfigContext } from '@/context/config'
import { useWrappedLogger } from '@/utils/logger'
import { useMultiLang } from '@/utils/mlang'
import { useRuntimeContext } from '@/context/runtime'
import { useUpdateEffect } from 'ahooks'
import './index.scss'

interface IProps extends MultiLangProps {}

const baseCls = 'basecfg'
const Content: FC<IProps> = (props) => {
  const [config, setConfig] = useConfigContext()
  const [runtime, setRuntime] = useRuntimeContext()
  const { fmlName, fmlText } = useMultiLang(config, baseCls, props.inheritName)
  const { logs, logger } = useWrappedLogger()
  const { message } = App.useApp()
  const { listenTauri } = useContext(SysUtilContext)
  const [activeKey, setActiveKey] = useState<string[]>([])

  const onDropSource = async (path: string[]) => {
    const dirPath: string[] = []
    for (const i of path) {
      const res = await invoke('path_is_dir', { path: i })
      if (res) { dirPath.push(i) }
    }
    if (dirPath.length > 0) {
      if (dirPath.length !== path.length) {
        message.warning(fmlText('msg_drop_impure'))
      }
      for (const i of dirPath) {
        const conflict = await isPathConflict(i)
        if (conflict) return
      }

      setRuntime('u_source', runtime.source.concat(dirPath))
    } else {
      message.error(fmlText('msg_no_source'))
    }
  }

  useEffect(() => {
    const eFileDrop = listenTauri("tauri://file-drop", (e: any) => {
      if (Array.isArray(e.payload) && e.payload.length > 0) {
        onDropSource(e.payload)
      }
    })
    return () => { eFileDrop.then(i => i()) }
  }, [])

  /** Refresh file list when receive signal */
  useUpdateEffect(() => {
    console.log('I: SIG_RECV/REFRESH_SOURCE', runtime.sync.action > runtime.sync.refresh)
    if (runtime.sync.action > runtime.sync.refresh) {
      refreshFileList()
    }
  }, [runtime.sync.action, runtime.sync.refresh])

  const refreshFileList = async () => {
    const withKey = (content: string, duration?: number) => ({ content, duration, key: 'refresh_source' })
    message.info(withKey(fmlText('msg_load_start'), 0))
    let totalCount = 0
    let files: FileItemExtend[] = []
    if (runtime.source.length > 0) {
      // check warn limit
      try {
        let warnCount = 0
        for (const path of runtime.source) {
          const count: number = await invoke('fetch_file_count', {
            path,
            recursive: runtime.config.recursive,
            max: config.system?.limit.warn,
            start: warnCount
          })
          warnCount = count
        }
        totalCount = warnCount
      } catch (e) {
        if (e === 'MAX_LIMIT') {
          message.warning(fmlText('msg_warn_limit'))
        } else {
          logger.error(`RefreshFileList: warn error, ${e}`)
          message.error(withKey(fmlText('msg_unknown_err', `${e}`)))
          return
        }
      }
      // count actual files
      try {
        if (totalCount === 0) {
          for (const path of runtime.source) {
            const count: number = await invoke('fetch_file_count', {
              path,
              recursive: runtime.config.recursive,
              max: config.system?.limit.max,
              start: totalCount
            })
            totalCount = count
            logger.info(`RefreshFileList: source ${path} has ${count} files`)
          }
        }
      } catch (e) {
        if (e === 'MAX_LIMIT') {
          logger.error('RefreshFileList: file count exceed max limit')
          message.error(withKey(fmlText('msg_max_limit')))
        } else {
          logger.error(`RefreshFileList: other error, ${e}`)
          message.error(withKey(fmlText('msg_unknown_err', `${e}`)))
        }
        return
      }
      logger.info(`RefreshFileList: count finished, total ${totalCount} files`)
      // Read files
      try {
        for (const path of runtime.source) {
          const res: any[] = await invoke('fetch_file_list', {
            path,
            recursive: runtime.config.recursive,
          })
          files = files.concat(res.map(i => ({
            name: i['name'],
            path: i['path'],
            fileName: i['file_name'],
            fileExt: i['file_ext'],
            size: i['size'],
            steps: []
          })))
          logger.info(`RefreshFileList: source ${path} read ${res.length} files`)
        }
      } catch (e) {
        logger.error(`RefreshFileList: READ stage with other error, ${e}`)
        message.error(withKey(fmlText('msg_unknown_err', `${e}`)))
        return
      }
      logger.info(`RefreshFileList: read finished, total ${files.length} files`)
    }
    // final dispatch
    message.success(withKey(fmlText('msg_load_success')))
    setRuntime('u_file_list', files)
    setRuntime('sig_refresh')
  }

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

  const isPathConflict = async (path: string) => {
    // Check path conflicts
    const conflicts = runtime.source.filter(i => {
      let conflict = false
      if (path.length === i.length) {
        conflict = path === i
      } else if (path.length > i.length) {
        conflict = path.startsWith(i + '\\') || path.startsWith(i + '/')
      } else {
        conflict = i.startsWith(path + '\\') || i.startsWith(path + '/')
      }
      return conflict
    })
    if (conflicts.length > 0) {
      message.error(fmlText('msg_source_conflict'))
      logger.warn(`Conflict source folder: ${conflicts.join(', ')}`)
      return true
    } else {
      return false
    }
  }

  const onSelectSource = async () => {
    const res = await fsOpenDialog(fmlText('uim_source'))
    if (res) {
      const conflict = await isPathConflict(res)
      if (!conflict) setRuntime('c_source', res)
    }
  }

  const items: CollapseProps['items'] = [
    {
      key: 'main',
      showArrow: false,
      children: (
        <div className={`${baseCls}-extra-cfg`}>
          <div className={`${baseCls}-extra-cfg-title`}>&gt;&nbsp;{fmlText('ui_read_method')}</div>
          <Segmented
            options={[
              { label: fmlText('ui_current'), value: 0 },
              { label: fmlText('ui_recursive'), value: 1 }
            ]}
            value={runtime.config.recursive ? 1 : 0}
            onChange={i => {
              logger.info(`BaseCfg: recursive changes to '${!!i}'`)
              setRuntime('u_config_partial', { recursive: !!i })
              setRuntime('sig_action')
            }}
          />
          <div className={`${baseCls}-extra-cfg-title`}>&gt;&nbsp;{fmlText('ui_proc_method')}</div>
          <Segmented
            options={[
              { label: fmlText('ui_file_copy'), value: 'copy' },
              { label: fmlText('ui_file_move'), value: 'move' }
            ]}
            value={runtime.config.outputMethod}
            onChange={i => {
              logger.info(`BaseCfg: outputMethod changes to '${i}'`)
              setRuntime('u_config_partial', { outputMethod: i })
            }}
          />
        </div>
      ),
    },
  ]

  return (<div className={baseCls}>
    <Flex className={`${baseCls}-main`} justify='space-between'>
      <Button
        icon={<FolderOpenOutlined />}
        size='small'
        type='text'
        onClick={() => onSelectSource()}
      >{fmlText('ui_source')}</Button>
      <Button
        icon={<DeleteOutlined />}
        size='small'
        title={fmlText('ui_source_cls')}
        type='text'
        onClick={() => runtime.source.length > 0 ? setRuntime('d_source') : message.warning(fmlText('msg_no_source'))}
      />
      <Button
        icon={<ReloadOutlined />}
        size='small'
        title={fmlText('ui_source_rfs')}
        type='text'
        onClick={() => setRuntime('sig_action')}
      />
      <Button
        icon={<MenuOutlined />}
        size='small'
        title={fmlText('ui_source_ext')}
        type='text'
        onClick={() => setActiveKey(key => key.length > 0 ? [] : ['main'])}
      />
    </Flex>
    <Collapse
      activeKey={activeKey}
      className={`${baseCls}-extra`}
      ghost
      items={items}
      size='small'
    />
    <Flex className={`${baseCls}-src`} vertical gap='3px'>{
      runtime.source.map((i, idx) => (
        <Flex key={idx} className={`${baseCls}-src-item`} justify='space-between'>
          <div className={`${baseCls}-src-item-text`} title={i}>{i}</div>
          <Flex className={`${baseCls}-src-item-btns`} gap='2px'>
            <Button
              icon={<CloseOutlined />}
              size='small'
              title={fmlText('ui_source_del')}
              type='text'
              onClick={() => setRuntime('u_source', runtime.source.filter(j => i !== j))}
            />
          </Flex>
        </Flex>
      ))
    }</Flex>
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as BaseConfig }
export type { IProps as BaseConfigProps }