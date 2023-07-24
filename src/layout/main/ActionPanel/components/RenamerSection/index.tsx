import RenamerSectionItem from '../RenamerSectionItem'
import useGlobalData from '@/utils/hooks/useGlobalData'
import useLogger from '@/utils/logger'
import { ControlButton } from '@/common/ControlButton'
import { Dispatch, FC, useMemo, useReducer } from 'react'
import { IFileItemRenamed } from '@/types/file'
import { IScriptConfig } from '@/types/script'
import { PlusOutlined, SyncOutlined } from '@ant-design/icons'
import { cloneDeep } from 'lodash'
import { getDefaultRenamer } from '@/utils/renamer'
import { message } from 'antd'
import { uuid } from '@/utils/common'
import './index.scss'

export type ContentProps = {}

interface IState {
  renamers: IScriptConfig[]
}
type IOptionalState = Partial<IState>

const initState: IState = {
  renamers: []
}

const reducer = (state: IState, payload: IOptionalState) => Object.assign({}, state, payload)

const baseCls = 'renamer-section'
const Content: FC<ContentProps> = () => {
  const { globalData, setGlobalData } = useGlobalData()
  const { logger } = useLogger()
  const [state, dispatch] = useReducer(reducer, initState) as [IState, Dispatch<IOptionalState>]

  const handleAddRenamer = () => {
    const newRenamers = [...state.renamers, cloneDeep(getDefaultRenamer(uuid()))]
    dispatch({
      renamers: newRenamers
    })
  }

  const handleRunRenamer = () => {
    if (globalData.filesOriginal.length === 0) {
      message.info('请先加载文件列表')
      return
    }
    if (state.renamers.length === 0) {
      message.info('请先添加重命名步骤')
      return
    }
    // acquire file list
    let filesToRename = globalData.filesFiltered ?? globalData.filesOriginal
    if (!globalData.filesFiltered) {
      message.warning('未执行过滤，使用源文件列表执行操作')
    } else {
      message.info('重命名文件列表...')
    }
    filesToRename = cloneDeep(filesToRename) as IFileItemRenamed[]
    // reassemble renamer list
    const renamerArr = state.renamers.map(cfg => {
      return {
        func: globalData.sysRenamers[cfg.scriptId].func,
        params: cfg.scriptParam
      }
    })
    // run renamer
    const totalFileCount = filesToRename.length
    const newFileList = filesToRename.reduce((prev, item, index, list) => {
      renamerArr.forEach(renamer => {
        const res = renamer.func({
          fileItem: item,
          fileList: list,
          index,
          total: totalFileCount
        }, renamer.params)
        Object.assign(item, res)
      })
      prev.push(item)
      return prev
    }, [] as IFileItemRenamed[])
    newFileList.map(item => {
      item.rename_full_name = item.rename_full_name ?? item.full_name
      item.rename_name = item.rename_name ?? item.name
      item.rename_extension = item.rename_extension ?? item.extension
      return item
    })
    setGlobalData('u_renamed_files', newFileList)
    message.success('文件列表重命名完成')
  }

  const handleUpdateRenamer = (renamerConfig: IScriptConfig) => {
    const copiedRenamers = cloneDeep(state.renamers)
    const renamerIndex = copiedRenamers.findIndex(item => item.id === renamerConfig.id)
    copiedRenamers[renamerIndex] = renamerConfig
    dispatch({ renamers: copiedRenamers })
  }

  const handleRemoveRenamer = (renamerConfig: IScriptConfig) => {
    const copiedRenamers = cloneDeep(state.renamers)
    const renamerIndex = copiedRenamers.findIndex(item => item.id === renamerConfig.id)
    copiedRenamers.splice(renamerIndex, 1)
    dispatch({ renamers: copiedRenamers })
  }

  const renderRenamers = useMemo(() => {
    return state.renamers.map((item, index) => {
      return (
        <div className={`${baseCls}-filters-item`} key={index}>
          <RenamerSectionItem
            globalData={globalData}
            logger={logger}
            renamerConfig={item}
            onChange={handleUpdateRenamer}
            onRemove={handleRemoveRenamer}
          />
        </div>
      )
    })
  }, [state.renamers])

  return (<div className={baseCls}>
    <div className={`${baseCls}-renamers`}>
      {renderRenamers}
    </div>
    <div className={`${baseCls}-controls`}>
      <ControlButton
        icon={<PlusOutlined />}
        onClick={handleAddRenamer}
      >新增步骤</ControlButton>
      <ControlButton
        icon={<SyncOutlined />}
        onClick={handleRunRenamer}
      >重命名</ControlButton>
    </div>
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export default Content