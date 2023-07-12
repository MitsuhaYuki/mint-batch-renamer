import FilterSectionItem from '../FilterSectionItem'
import React, { FC, useMemo, useReducer } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import useGlobalData from '@/utils/hooks/useGlobalData'
import useLogger from '@/utils/logger'
import { ControlButton } from '@/common/ControlButton'
import { EFilterScope, IFileListScopeFilterArgs, IFileNameScopeFilterArgs, IFilterConfig, ICommonFilterFunction } from '@/types/filter'
import { IFileItem } from '@/types/file'
import { PlusOutlined, SyncOutlined } from '@ant-design/icons'
import { getDefaultFilter, getFilters } from '@/utils/filter'
import { message } from 'antd'
import { uuid } from '@/utils/common'
import './index.scss'

export type ContentProps = {}

interface IState {
  filters: IFilterConfig[]
}
type IOptionalState = Partial<IState>

const initState: IState = {
  filters: []
}

const reducer = (state: IState, payload: IOptionalState) => Object.assign({}, state, payload)

const baseCls = 'filter-section'
const Content: FC<ContentProps> = () => {
  const { globalData, setGlobalData } = useGlobalData()
  const { logger } = useLogger()
  const [state, dispatch] = useReducer(reducer, initState) as [IState, React.Dispatch<IOptionalState>]

  const handleAddFilter = () => {
    const newFilters = [...state.filters, getDefaultFilter(uuid())]
    dispatch({
      filters: newFilters
    })
  }

  const handleRunFilter = () => {
    if (globalData.filesOriginal.length === 0) {
      message.info('请先加载文件列表')
    } else {
      message.info('过滤文件列表...')
      const filterSet = getFilters(globalData.sysFilters, globalData.sysFiltersExt)
      let copiedFileList = cloneDeep(globalData.filesOriginal)
      const filterArr = state.filters.map(cfg => {
        return {
          scope: filterSet[cfg.filterId].scope,
          func: filterSet[cfg.filterId].func,
          params: cfg.filterParams
        }
      })
      filterArr.forEach(item => {
        switch (item.scope) {
          case EFilterScope.fileName: {
            const filterFunc = item.func as ICommonFilterFunction<IFileNameScopeFilterArgs>
            copiedFileList = copiedFileList.filter(i => filterFunc({
              fullName: i.full_name,
              fileName: i.name,
              extName: i.extension
            }, item.params))
            break
          }
          case EFilterScope.fileList: {
            const filterFunc = item.func as ICommonFilterFunction<IFileListScopeFilterArgs, IFileItem[]>
            copiedFileList = filterFunc({ fileList: copiedFileList }, item.params)
          }
          default:
            break
        }
      })
      setGlobalData('u_filtered_files', copiedFileList)
      message.success('文件列表过滤完成')
    }
  }

  const handleUpdateFilter = (filterConfig: IFilterConfig) => {
    const copiedFilters = cloneDeep(state.filters)
    const filterIndex = copiedFilters.findIndex(item => item.id === filterConfig.id)
    copiedFilters[filterIndex] = filterConfig
    dispatch({ filters: copiedFilters })
  }

  const handleRemoveFilter = (filterConfig: IFilterConfig) => {
    const copiedFilters = cloneDeep(state.filters)
    const filterIndex = copiedFilters.findIndex(item => item.id === filterConfig.id)
    copiedFilters.splice(filterIndex, 1)
    dispatch({ filters: copiedFilters })
  }

  const renderFilters = useMemo(() => {
    return state.filters.map((item, index) => (
      <div className={`${baseCls}-filters-item`} key={index}>
        <FilterSectionItem
          filterConfig={item}
          globalData={globalData}
          logger={logger}
          onChange={handleUpdateFilter}
          onRemove={handleRemoveFilter}
        />
      </div>
    ))
  }, [state.filters])

  return (<div className={baseCls}>
    <div className={`${baseCls}-filters`}>
      {renderFilters}
    </div>
    <div className={`${baseCls}-controls`}>
      <ControlButton
        icon={<PlusOutlined />}
        onClick={handleAddFilter}
      >新增规则</ControlButton>
      <ControlButton
        icon={<SyncOutlined />}
        onClick={handleRunFilter}
      >过滤</ControlButton>
    </div>
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export default Content