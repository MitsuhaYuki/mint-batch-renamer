import { ArrowDownOutlined, ArrowUpOutlined, CloseOutlined } from '@ant-design/icons'
import { Button, Flex } from 'antd'
import { FC, useMemo, useRef } from 'react'
import { FlowControl } from './FlowControl'
import { FlowManage } from './FlowManage'
import { MultiLangProps } from '@/types/mlang'
import { TaskCfgModal, TaskCfgModalRef } from './TaskConfigModal'
import { TaskRunnerConfig } from '@/types/task'
import { useConfigContext } from '@/context/config'
import { useLogger } from '@/utils/logger'
import { useMultiLang } from '@/utils/mlang'
import { useRuntimeContext } from '@/context/runtime'
import './index.scss'

interface IProps extends MultiLangProps {}

const baseCls = 'taskflow'
const Content: FC<IProps> = (props) => {
  // Global Config
  const [config, setConfig] = useConfigContext()
  // Runtime Data
  const [runtime, setRuntime] = useRuntimeContext()
  // Multi-Language
  const { fmlName, fmlText } = useMultiLang(config, baseCls, props.inheritName)
  // Logs
  const { logs, logger } = useLogger()

  const cfgModal = useRef<TaskCfgModalRef>(null)

  // FIXME: 如果处理步骤发生变化，且当前存在上一次运行的结果，则需要重新刷新源列表

  const onEditTask = (task: TaskRunnerConfig) => {
    cfgModal.current?.open(task)
  }

  const onUpdateTask = (task: TaskRunnerConfig) => {
    setRuntime('u_tasks_one', task)
  }

  const renderTasks = useMemo(() => {
    return runtime.tasks.map((task, idx) => (
      <Flex key={idx} className={`${baseCls}-tasks-item`} justify='space-between'>
        <div
          className={`${baseCls}-tasks-item-text`}
          title={task.name}
          onClick={() => onEditTask(task)}
        >{task.name}</div>
        <Flex className={`${baseCls}-tasks-item-btns`} gap='2px'>
          <Button
            icon={<ArrowUpOutlined />}
            size='small'
            type='text'
            disabled={idx === 0}
            onClick={() => {
              const tasks = runtime.tasks
              const swapTasks = tasks.map((i, j) => {
                if (j === idx - 1) return tasks[j + 1]
                if (j === idx) return tasks[j - 1]
                return i
              })
              setRuntime('u_tasks_all', swapTasks)
            }}
          />
          <Button
            icon={<ArrowDownOutlined />}
            size='small'
            type='text'
            disabled={idx === runtime.tasks.length - 1}
            onClick={() => {
              const tasks = runtime.tasks
              const swapTasks = tasks.map((i, j) => {
                if (j === idx + 1) return tasks[j - 1]
                if (j === idx) return tasks[j + 1]
                return i
              })
              setRuntime('u_tasks_all', swapTasks)
            }}
          />
          <Button
            icon={<CloseOutlined />}
            size='small'
            type='text'
            onClick={() => setRuntime('d_tasks_one', task)}
          />
        </Flex>
      </Flex>
    ))
  }, [runtime.tasks])

  return (<div className={baseCls}>
    <Flex className={`${baseCls}-main`} wrap='wrap'>
      <FlowControl
        config={{ state: config, set: setConfig }}
        runtime={{ state: runtime, set: setRuntime }}
        con={{ logs, logger }}
        inheritName={fmlName}
      />
      <FlowManage
        config={{ state: config, set: setConfig }}
        runtime={{ state: runtime, set: setRuntime }}
        con={{ logs, logger }}
        inheritName={fmlName}
      />
    </Flex>
    <div className={`${baseCls}-tasks`}>
      <Flex className={`${baseCls}-tasks-inner`} vertical gap='4px'>
        {renderTasks}
      </Flex>
    </div>
    <TaskCfgModal
      config={{ state: config, set: setConfig }}
      runtime={{ state: runtime, set: setRuntime }}
      con={{ logs, logger }}
      inheritName={fmlName}
      ref={cfgModal}
      onOk={onUpdateTask}
    />
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as TaskFlow }
export type { IProps as TaskFlowProps }