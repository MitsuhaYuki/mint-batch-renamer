import { TaskRunner, TaskRunnerSysArg, TaskRunnerType } from '@/types/task'

const renameTaskRunners: Record<string, TaskRunner> = {
  'r_clear': {
    id: 'r_clear',
    name: {
      'zh-CN': '清空字段',
      'en-US': 'Clear Field',
    },
    desc: {
      'zh-CN': '清空特定的文件字段, 使下一步处理时该字段为空字符串',
      'en-US': 'Clear specified file field, make it empty string in next step',
    },
    type: TaskRunnerType.renamer,
    args: [{
      id: 'range',
      name: {
        'zh-CN': '范围',
        'en-US': 'Range',
      },
      desc: {
        'zh-CN': '要清空的字段',
        'en-US': 'Field to clear',
      },
      type: 'radio-button',
      options: [{
        label: {
          'zh-CN': '文件名',
          'en-US': 'File Name',
        },
        value: 'name',
      }, {
        label: {
          'zh-CN': '扩展名',
          'en-US': 'Extension',
        },
        value: 'ext',
      }],
      default: 'name',
      readonly: false,
    }],
    func: (sys: TaskRunnerSysArg, ext: Record<string, any>) => {
      return sys.fileItem(async (split, forward) => {
        const { latest } = split()
        const { range } = ext
        if (range === 'name') {
          latest.fileName = ''
        } else {
          latest.fileExt = ''
        }
        latest.name = `${latest.fileName}.${latest.fileExt}`
        forward({
          result: latest,
          message: 'Reset file name',
          next: true
        })
      })
    }
  },
  'r_static': {
    id: 'r_static',
    name: {
      'zh-CN': '静态文本',
      'en-US': 'Static Text',
    },
    desc: {
      'zh-CN': '在文件名前后添加指定的文本.',
      'en-US': 'Add specified text before and after file name.',
    },
    type: TaskRunnerType.renamer,
    args: [{
      id: 'range',
      name: {
        'zh-CN': '范围',
        'en-US': 'Range',
      },
      desc: {
        'zh-CN': '添加文本的范围, 可选项: 文件名, 扩展名.',
        'en-US': 'Range of text, options: File Name, Extension.',
      },
      type: 'radio-button',
      options: [{
        label: {
          'zh-CN': '文件名',
          'en-US': 'File Name',
        },
        value: 'name',
      }, {
        label: {
          'zh-CN': '扩展名',
          'en-US': 'Extension',
        },
        value: 'ext',
      }],
      default: 'name',
      readonly: false,
    }, {
      id: 'position',
      name: {
        'zh-CN': '位置',
        'en-US': 'Position',
      },
      desc: {
        'zh-CN': '添加文本的位置, 可选项: 前缀, 后缀.',
        'en-US': 'Position of text, options: Before, After.',
      },
      type: 'radio-button',
      options: [{
        label: {
          'zh-CN': '前缀',
          'en-US': 'Before',
        },
        value: 'before',
      }, {
        label: {
          'zh-CN': '后缀',
          'en-US': 'After',
        },
        value: 'after',
      }],
      default: 'after',
      readonly: false,
    }, {
      id: 'str',
      name: {
        'zh-CN': '文本',
        'en-US': 'Text',
      },
      desc: {
        'zh-CN': '将要添加的文本.',
        'en-US': 'Text to add.',
      },
      type: 'string',
      readonly: false,
    }],
    func: (sys: TaskRunnerSysArg, ext: Record<string, any>) => {
      return sys.fileItem(async (split, forward) => {
        const { origin, latest, steps } = split()
        const { range, position, str } = ext
        const { fileName, fileExt } = latest
        let newFileName = fileName
        let newFileExt = fileExt
        if (range === 'name') {
          if (position === 'before') {
            newFileName = `${str}${newFileName}`
          } else {
            newFileName = `${newFileName}${str}`
          }
        } else {
          if (position === 'before') {
            newFileExt = `${str}${newFileExt}`
          } else {
            newFileExt = `${newFileExt}${str}`
          }
        }
        forward({
          result: {
            ...latest,
            name: `${newFileName}.${newFileExt}`,
            fileName: newFileName,
            fileExt: newFileExt,
          },
          message: `Add '${str}' to ${position} ${range}`,
          next: true
        })
      })
    }
  },
  'r_serial': {
    id: 'r_serial',
    name: {
      'zh-CN': '序列号',
      'en-US': 'Serial Number',
    },
    desc: {
      'zh-CN': '在选定位置添加可定制的序列号.',
      'en-US': 'Add customizable serial number at specified position.',
    },
    type: TaskRunnerType.renamer,
    args: [{
      id: 'range',
      name: {
        'zh-CN': '范围',
        'en-US': 'Range',
      },
      desc: {
        'zh-CN': '添加文本的范围, 可选项: 文件名, 扩展名.',
        'en-US': 'Range of text, options: File Name, Extension.',
      },
      type: 'radio-button',
      options: [{
        label: {
          'zh-CN': '文件名',
          'en-US': 'File Name',
        },
        value: 'name',
      }, {
        label: {
          'zh-CN': '扩展名',
          'en-US': 'Extension',
        },
        value: 'ext',
      }],
      default: 'name',
      readonly: false,
    }, {
      id: 'position',
      name: {
        'zh-CN': '位置',
        'en-US': 'Position',
      },
      desc: {
        'zh-CN': '添加文本的位置, 可选项: 前部, 后部.',
        'en-US': 'Position of text, options: Before, After.',
      },
      type: 'radio-button',
      options: [{
        label: {
          'zh-CN': '前部',
          'en-US': 'Before',
        },
        value: 'before',
      }, {
        label: {
          'zh-CN': '后部',
          'en-US': 'After',
        },
        value: 'after',
      }],
      default: 'after',
      readonly: false,
    }, {
      id: 'start',
      name: {
        'zh-CN': '起始值',
        'en-US': 'Start Value',
      },
      desc: {
        'zh-CN': '序列号的起始值.',
        'en-US': 'Start value of serial number.',
      },
      type: 'number',
      default: 1,
      readonly: false,
    }, {
      id: 'step',
      name: {
        'zh-CN': '步长',
        'en-US': 'Step',
      },
      desc: {
        'zh-CN': '序列号的步长.',
        'en-US': 'Step of serial number.',
      },
      type: 'number',
      default: 1,
      readonly: false,
    }, {
      id: 'length',
      name: {
        'zh-CN': '长度',
        'en-US': 'Length',
      },
      desc: {
        'zh-CN': '序列号的长度, 不足时前面补0. 设置为0则不自动补0.',
        'en-US': 'Length of serial number, fill with 0 when not enough. Set to 0 to disable auto fill.',
      },
      type: 'number',
      default: 0,
      readonly: false,
    }],
    func: (sys: TaskRunnerSysArg, ext: Record<string, any>) => {
      return sys.fileList(async (list, split, forward) => {
        const { range, position, start, step, length } = ext
        list.latest.forEach((fileItem, index) => {
          const { origin, latest, steps } = split(fileItem)
          const { fileName, fileExt } = latest
          let newFileName = fileName
          let newFileExt = fileExt
          const serial = start + index * step
          const serialStr = length > 0 ? serial.toString().padStart(length, '0') : serial.toString()
          if (range === 'name') {
            if (position === 'before') {
              newFileName = `${serialStr}${newFileName}`
            } else {
              newFileName = `${newFileName}${serialStr}`
            }
          } else {
            if (position === 'before') {
              newFileExt = `${serialStr}${newFileExt}`
            } else {
              newFileExt = `${newFileExt}${serialStr}`
            }
          }
          forward(fileItem, {
            result: {
              ...latest,
              name: `${newFileName}.${newFileExt}`,
              fileName: newFileName,
              fileExt: newFileExt,
            },
            message: `Add '${serialStr}' to ${position} ${range}`,
            next: true
          })
        })
      })
    }
  },
}

export {
  renameTaskRunners
}