import { Dispatch, FC, useEffect, useMemo, useReducer } from 'react'
import './index.scss'
import { IRenamerConfig } from '@/types/renamer'
import useGlobalData from '@/utils/hooks/useGlobalData'
import useLogger from '@/utils/logger'
import RenamerSectionItem from '../RenamerSectionItem'
import { Button, message } from 'antd'
import { PlusOutlined, SyncOutlined } from '@ant-design/icons'
import { cloneDeep } from 'lodash'
import { getDefaultRenamer } from '@/utils/renamer'
import { uuid } from '@/utils/common'
import { IFileItem } from '@/types/file'

export type ContentProps = {
  example?: any
}

interface IState {
  renamers: IRenamerConfig[]
}
type IOptionalState = Partial<IState>

const initState: IState = {
  renamers: []
}

const reducer = (state: IState, payload: IOptionalState) => Object.assign({}, state, payload)

const baseCls = 'renamer-section'
const Content: FC<ContentProps> = props => {
  const { globalData, setGlobalData } = useGlobalData()
  const { logger } = useLogger()
  const [state, dispatch] = useReducer(reducer, initState) as [IState, Dispatch<IOptionalState>]

  useEffect(() => {
    console.log('I: renamer-section state changed,', state)
  }, [state])

  const handleAddRenamer = () => {
    const newRenamers = [...state.renamers, cloneDeep(getDefaultRenamer(uuid()))]
    console.log('I: added filters list', newRenamers)
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
      message.info('请先添加重命名规则')
      return
    }
    // acquire file list
    let filesToRename = globalData.filesFiltered ?? globalData.filesOriginal
    if (!globalData.filesFiltered) {
      message.warning('未执行过滤，使用源文件列表执行操作')
    } else {
      message.info('重命名文件列表...')
    }
    filesToRename = cloneDeep(filesToRename)
    // reassemble renamer list
    const renamerArr = state.renamers.map(cfg => {
      return {
        func: globalData.sysRenamers[cfg.renamerId].func,
        params: cfg.renamerParams
      }
    })
    // run renamer
    const totalFileCount = filesToRename.length
    const newFileList = filesToRename.reduce((prev, item, index, list) => {
      const newFileItem = renamerArr.reduce((prevFileItem, renamer) => {
        const res = renamer.func({
          fileItem: prevFileItem,
          fileList: list,
          index,
          total: totalFileCount
        }, renamer.params)
        return res
      }, cloneDeep(item))
      prev.push(newFileItem)
      return prev
    }, [] as IFileItem[])
    newFileList.map(item => {
      item.rename_full_name = item.rename_full_name ?? item.full_name
      item.rename_name = item.rename_name ?? item.name
      item.rename_extension = item.rename_extension ?? item.extension
      return item
    })
    setGlobalData('u_renamed_files', newFileList)
    message.success('文件列表重命名完成')
  }

  const handleUpdateRenamer = (renamerConfig: IRenamerConfig) => {
    console.log('I: handleUpdateRenamer', renamerConfig)
    const copiedRenamers = cloneDeep(state.renamers)
    const renamerIndex = copiedRenamers.findIndex(item => item.id === renamerConfig.id)
    copiedRenamers[renamerIndex] = renamerConfig
    dispatch({ renamers: copiedRenamers })
  }

  const handleRemoveRenamer = (renamerConfig: IRenamerConfig) => {
    console.log('I: handleRemoveRenamer', renamerConfig)
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
      <Button
        icon={<PlusOutlined style={{ fontSize: '12px' }} title='新增步骤' />}
        size='small'
        type='text'
        onClick={handleAddRenamer}
      >新增步骤</Button>
      <Button
        icon={<SyncOutlined style={{ fontSize: '12px' }} title='重命名' />}
        size='small'
        type='text'
        onClick={handleRunRenamer}
      >重命名</Button>
    </div>
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export default Content