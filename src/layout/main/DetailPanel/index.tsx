import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './index.scss'
import { useConfigContext } from '@/context/config'
import { useRuntimeContext } from '@/context/runtime'
import { useMultiLang } from '@/utils/mlang'
import { useLogger } from '@/utils/logger'
import { FileItemExtend } from '@/types/file'
import { ColumnsType } from 'antd/es/table'
import { VirtualTable } from '@/components/VirtualTable'
import { MultiLangProps } from '@/types/mlang'
import { Button, Flex, Radio, Segmented } from 'antd'
import { useUpdateEffect } from 'ahooks'
import { TaskResult } from '@/types/task'
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons'

interface IProps extends MultiLangProps {}

const baseCls = 'details'
const Content: FC<IProps> = (props) => {
  // Global Config
  const [config, setConfig] = useConfigContext()
  // Runtime Data
  const [runtime, setRuntime] = useRuntimeContext()
  // Multi-Language
  const { fmlName, fmlText } = useMultiLang(config, baseCls, props.inheritName)
  // Logs
  const { logs, logger } = useLogger()

  const wrapperRef = useRef<HTMLDivElement>(null)

  // auto format file size with suffix KB, MB, GB, TB
  const formatFileSize = useCallback((size: number) => {
    if (size < 1024) return `${size} B`
    if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`
    if (size < 1073741824) return `${(size / 1048576).toFixed(2)} MB`
    if (size < 1099511627776) return `${(size / 1073741824).toFixed(2)} GB`
    return `${(size / 1099511627776).toFixed(2)} TB`
  }, [])

  // status icon for "ok" or "fail"
  const statusIcon = useCallback((ok: any) => {
    return ok
      ? <CheckCircleFilled style={{ color: '#52c41a', fontSize: '16px' }} />
      : <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: '16px' }} />
  }, [])

  // View Mode
  const [viewMode, setViewMode] = useState<'source' | 'result'>('source')
  // FIXME: 这里分离了过滤和数据之后，在更新数据的时候表格会闪烁，需要优化
  // Filter options in result mode
  const [resRange, setResRange] = useState<'all' | 'flow_ok' | 'output_ok'>('flow_ok')
  // Table data source with filter
  const [data, setData] = useState<FileItemExtend[]>([])

  /** Re-filter data when filter or data change */
  useEffect(() => {
    if (runtime.fileList.length > 0) {
      switch (resRange) {
        case 'all':
          setData(runtime.fileList)
          break
        case 'flow_ok':
          setData(runtime.fileList.filter((item) => item.steps.length > 0 && (item.steps[item.steps.length - 1].next || item.steps[item.steps.length - 1].to)))
          break
        case 'output_ok':
          setData(runtime.fileList.filter((item) => item.steps.length > 0 && item.steps[item.steps.length - 1].to))
          break
      }
    } else {
      setData([])
    }
  }, [runtime.fileList, resRange, viewMode])

  /** Auto toggle view when receive signal */
  useUpdateEffect(() => {
    console.log('I: SIG_RECV/TOGGLE_RESULT_VIEW', runtime.sync.preview > runtime.sync.refresh)
    if (runtime.sync.preview > runtime.sync.refresh) {
      if (viewMode === 'source') setViewMode('result')
    } else {
      if (viewMode === 'result') setViewMode('source')
    }
  }, [runtime.sync.refresh, runtime.sync.preview])

  const columns = useMemo((): ColumnsType<FileItemExtend> => {
    if (viewMode === 'source') {
      return [{
        title: fmlText('col_full'),
        dataIndex: 'name',
      }, {
        title: fmlText('col_size'),
        dataIndex: 'size',
        width: 75,
        render: (size: number) => formatFileSize(size),
      }, {
        title: fmlText('col_ext'),
        width: 80,
        dataIndex: 'fileExt',
      }, {
        title: fmlText('col_path'),
        dataIndex: 'path',
      }]
    } else {
      return [{
        title: fmlText('col_full'),
        dataIndex: 'name',
        view: ['all', 'flow_ok', 'output_ok'],
      }, {
        title: fmlText('col_latest_name'),
        dataIndex: 'steps',
        view: ['all', 'flow_ok'],
        render: (steps: TaskResult[]) => {
          const flag = steps.length > 0
          return flag ? steps[steps.length - 1].result.name : fmlText('res_empty')
        },
      }, {
        title: fmlText('col_res_name'),
        dataIndex: 'steps',
        view: ['all', 'output_ok'],
        render: (steps: TaskResult[]) => {
          const flag = steps.length > 0 && steps[steps.length - 1].to
          return flag ? steps[steps.length - 1].result.name : fmlText('res_empty')
        },
      }, {
        title: fmlText('col_flowpass'),
        dataIndex: 'steps',
        view: ['all', 'flow_ok', 'output_ok'],
        width: 50,
        render: (steps: TaskResult[]) => {
          const flag = steps.length > 0 && (steps[steps.length - 1].next || steps[steps.length - 1].to)
          return <div className={`${baseCls}-table-status`} title={
            flag ? fmlText('flowpass_ok') : fmlText('flowpass_fail')
          }>{statusIcon(flag)}</div>
        },
      }, {
        title: fmlText('col_complete'),
        dataIndex: 'steps',
        view: ['all', 'flow_ok', 'output_ok'],
        width: 60,
        render: (steps: TaskResult[]) => {
          const flag = steps.length > 0 && steps[steps.length - 1].to
          return <div className={`${baseCls}-table-status`} title={
            flag ? fmlText('complete_ok') : fmlText('complete_fail')
          }>{statusIcon(flag)}</div>
        },
      }].filter((item) => item.view.includes(resRange))
    }
  }, [fmlText, viewMode, resRange])

  return (<div className={baseCls}>
    <Flex className={`${baseCls}-toolbar`} gap='4px' justify='flex-end' style={{ padding: '4px' }}>
      <Segmented
        size='small'
        value={viewMode}
        options={[
          { label: fmlText('source_view'), title: fmlText('source_view_title'), value: 'source' },
          { label: fmlText('result_view'), title: fmlText('result_view_title'), value: 'result' }
        ]}
        onChange={(i: any) => setViewMode(i)}
      />
      <Segmented
        size='small'
        value={resRange}
        options={[
          { label: fmlText('filter_all'), title: fmlText('filter_all_title'), value: 'all' },
          { label: fmlText('filter_flowpass'), title: fmlText('filter_flowpass_title'), value: 'flow_ok' },
          { label: fmlText('filter_complete'), title: fmlText('filter_complete_title'), value: 'output_ok' }
        ]}
        disabled={viewMode === 'source'}
        onChange={(i: any) => setResRange(i)}
      />
    </Flex>
    <div className={`${baseCls}-table`} ref={wrapperRef}>
      <VirtualTable
        columns={columns}
        dataSource={viewMode === 'source' ? runtime.fileList : data}
        bordered={false}
        rowKey={'path'}
      />
    </div>
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as DetailPanel }
export type { IProps as DetailPanelProps }