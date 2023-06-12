import React, { FC, useEffect, useMemo, useReducer } from 'react'
import './index.scss'
import { Button, message } from 'antd'
import { PlusOutlined, SyncOutlined } from '@ant-design/icons'
import FilterSectionItem from '../FilterSectionItem'
import { EFilterScope, IFileListScopeFilterArgs, IFileNameScopeFilterArgs, IFilterConfig, IGeneralFilterFunction } from '@/types/filter'
import cloneDeep from 'lodash/cloneDeep'
import useGlobalData from '@/utils/hooks/useGlobalData'
import useLogger from '@/utils/logger'
import { uuid } from '@/utils/common'
import { getDefaultFilter } from '@/utils/filter'
import { IFileItem } from '@/types/file'

export type ContentProps = {
}

interface IState {
  filters: IFilterConfig[]
}
type IOptionalState = Partial<IState>

const initState: IState = {
  filters: []
}

const reducer = (state: IState, payload: IOptionalState) => Object.assign({}, state, payload)

const baseCls = 'filter-section'
const Content: FC<ContentProps> = props => {
  const { globalData, setGlobalData } = useGlobalData()
  const { logger } = useLogger()
  const [state, dispatch] = useReducer(reducer, initState) as [IState, React.Dispatch<IOptionalState>]

  useEffect(() => {
    console.log('I: filter-section state changed,', state)
  }, [state])

  const handleAddFilter = () => {
    const newFilters = [...state.filters, getDefaultFilter(uuid())]
    console.log('I: added filters list', newFilters)
    dispatch({
      filters: newFilters
    })
  }

  const handleRunFilter = () => {
    if (globalData.filesOriginal.length === 0) {
      message.info('请先加载文件列表')
    } else {
      message.info('过滤文件列表...')
      let copiedFileList = cloneDeep(globalData.filesOriginal)
      const filterArr = state.filters.map(cfg => {
        return {
          scope: globalData.sysFilters[cfg.filterId].scope,
          func: globalData.sysFilters[cfg.filterId].func,
          params: cfg.filterParams
        }
      })
      filterArr.forEach(item => {
        switch (item.scope) {
          case EFilterScope.fileName: {
            const filterFunc = item.func as IGeneralFilterFunction<IFileNameScopeFilterArgs>
            copiedFileList = copiedFileList.filter(i => filterFunc({
              fullName: i.full_name,
              fileName: i.name,
              extName: i.extension
            }, item.params))
            break
          }
          case EFilterScope.fileList: {
            const filterFunc = item.func as IGeneralFilterFunction<IFileListScopeFilterArgs, IFileItem[]>
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
    console.log('I: handleUpdateFilter', filterConfig)
    const copiedFilters = cloneDeep(state.filters)
    const filterIndex = copiedFilters.findIndex(item => item.id === filterConfig.id)
    copiedFilters[filterIndex] = filterConfig
    dispatch({ filters: copiedFilters })
  }

  const handleRemoveFilter = (filterConfig: IFilterConfig) => {
    console.log('I: handleRemoveFilter', filterConfig)
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
      <Button
        icon={<PlusOutlined style={{ fontSize: '12px' }} title='新增过滤器' />}
        size='small'
        type='text'
        onClick={handleAddFilter}
      >新增过滤器</Button>
      <Button
        icon={<SyncOutlined style={{ fontSize: '12px' }} title='过滤' />}
        size='small'
        type='text'
        onClick={handleRunFilter}
      >过滤</Button>
    </div>
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export default Content