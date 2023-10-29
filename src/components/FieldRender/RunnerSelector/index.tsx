import { WithConfigProps, WithConsoleProps } from '@/types/common'
import { MultiLangProps } from '@/types/mlang'
import { TaskRunner } from '@/types/task'
import { fmlField, useMultiLang } from '@/utils/mlang'
import { Flex, Select } from 'antd'
import { FC, useEffect, useState } from 'react'
import { TaskRunnerType } from '@/types/task'

interface IProps extends MultiLangProps, WithConsoleProps, WithConfigProps {
  runners: Record<string, TaskRunner>,
  value?: string,
  onChange?: (value: string) => void
}

const baseCls = 'field-runner'
const Content: FC<IProps> = (props) => {
  const { config, con, runners, value, onChange } = props
  const { logger } = con
  const { fmlName, fmlText } = useMultiLang(config.state, baseCls, props.inheritName)

  const [runnerType, setRunnerType] = useState<string>('all')
  const [runnerInstOpt, setRunnerInstOpt] = useState<any[]>([])

  const allRunnerType = Object.keys(TaskRunnerType).reduce((acc, cur) => {
    acc.push({ label: fmlText(`fields:runner_type_${cur}`), value: cur })
    return acc
  }, [{ label: fmlText('fields:runner_type_all'), value: 'all' }] as any[])

  const allRunnerInst = Object.keys(runners).reduce((acc, cur) => {
    acc.push({ label: fmlField(runners[cur].name, config.state), value: cur, type: runners[cur].type })
    return acc
  }, [] as any[])

  useEffect(() => {
    if (runnerType && runnerInstOpt.length > 0) setRunnerInstOpt(filterRunnerInst(runnerType))
  }, [fmlText])

  useEffect(() => {
    if (value) {
      const findAll = allRunnerInst.filter((item) => item.value === value)
      const findLocal = runnerInstOpt.filter((item) => item.value === value)
      if (findAll.length > 0) {
        if (findLocal.length === 0) {
          setRunnerType(findAll[0].value === 'default' ? 'all' : findAll[0].type)
          setRunnerInstOpt(findAll[0].value === 'default' ? allRunnerInst : filterRunnerInst(findAll[0].type))
        }
      } else {
        onChange?.('')
      }
    }
  }, [value])

  const filterRunnerInst = (type: string) => {
    if (type === 'all') return allRunnerInst
    return allRunnerInst.filter((item) => item.type === type)
  }

  const onRunnerTypeChange = (value: string) => {
    setRunnerType(value)
    const inst = filterRunnerInst(value)
    setRunnerInstOpt(inst)
    onChange?.(inst.length > 0 ? inst[0].value : '')
  }

  return (<div className={baseCls}>
    <Flex className={`${baseCls}-main`} justify='space-between' gap='8px'>
      <Flex flex='1 1 40%'>
        <Select
          className={`${baseCls}-main-select`}
          options={allRunnerType}
          value={runnerType}
          onChange={onRunnerTypeChange}
        />
      </Flex>
      <Flex flex='1 1 60%'>
        <Select
          className={`${baseCls}-main-select`}
          options={runnerInstOpt}
          value={value}
          onChange={v => onChange?.(v)}
        />
      </Flex>
    </Flex>
  </div>)
}

Content.defaultProps = {}
Content.displayName = baseCls
export { Content as RunnerSelector }
export type { IProps as RunnerSelectorProps }