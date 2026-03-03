<template>
  <div class="quill-editor-container">
    <QuillEditor
      ref="quillEditor"
      :model-value="currentContent"
      :options="editorOptions"
      :style="editorStyle"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, onUnmounted } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import { debounce } from 'lodash'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入内容...'
  },
  style: {
    type: Object,
    default: () => ({ height: '300px' })
  }
})

const emit = defineEmits(['update:modelValue'])

const quillEditor = ref<any>(null)
const currentContent = ref('')
let isChanging = false // 防止循环更新
let lastEmittedValue = '' // 记录上次发出的值
let textChangeHandler: (() => void) | null = null // 保存事件处理器引用

// 内容标准化函数
const normalizeContent = (content: string | undefined | null): string => {
  if (!content || content.trim() === '') {
    return '<p><br></p>'
  }
  return content
}

// 初始化时设置初始值
currentContent.value = normalizeContent(props.modelValue)
lastEmittedValue = currentContent.value

// 编辑器配置
const editorOptions = {
  theme: 'snow',
  placeholder: props.placeholder,
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    syntax: {
      highlight: (text: string) => hljs.highlightAuto(text).value
    }
  }
}

const editorStyle = props.style

// 错误处理函数
const handleEditorError = (error: Error, operation: string) => {
  console.error(`QuillEditor ${operation} error:`, error)
}

// 监听父组件传入的值变化
watch(() => props.modelValue, (newVal) => {
  if (isChanging) return // 防止循环更新

  const normalizedValue = normalizeContent(newVal)

  // 添加内容对比，避免不必要的更新
  if (normalizedValue === currentContent.value) {
    return
  }

  isChanging = true
  currentContent.value = normalizedValue

  // 更新编辑器内容
  nextTick(() => {
    try {
      const editor = quillEditor.value?.getQuill()
      if (editor) {
        if (normalizedValue === '<p><br></p>') {
          editor.setContents([{ insert: '\n' }])
        } else {
          // 总是更新内容以确保回显正确
          editor.root.innerHTML = normalizedValue

          // 重新应用代码高亮
          const codeBlocks = editor.root.querySelectorAll('pre')
          codeBlocks.forEach((block: Element) => {
            block.classList.add('ql-syntax')
          })
        }
        lastEmittedValue = editor.root.innerHTML || normalizedValue
      }
    } catch (error) {
      handleEditorError(error as Error, 'content update')
    } finally {
      setTimeout(() => {
        isChanging = false
      }, 0)
    }
  })
}, { immediate: true })

// 组件挂载后初始化编辑器
onMounted(() => {
  const editor = quillEditor.value?.getQuill()
  if (editor) {
    // 使用防抖处理文本变化事件
    const debouncedTextChange = debounce(() => {
      if (isChanging) return

      try {
        const html = editor.root.innerHTML

        // 只有当内容真正改变时才触发更新
        if (html !== lastEmittedValue) {
          currentContent.value = html
          lastEmittedValue = html
          emit('update:modelValue', html)
        }
      } catch (error) {
        handleEditorError(error as Error, 'text change handling')
      }
    }, 300) // 300ms 防抖延迟

    // 保存事件处理器引用以便后续清理
    textChangeHandler = debouncedTextChange

    editor.on('text-change', debouncedTextChange)

    nextTick(() => {
      // 确保编辑器内容与传入的值一致
      const normalizedValue = normalizeContent(props.modelValue)
      if (normalizedValue !== '<p><br></p>') {
        editor.root.innerHTML = normalizedValue
        lastEmittedValue = editor.root.innerHTML
      } else {
        lastEmittedValue = editor.root.innerHTML || '<p><br></p>'
      }
    })
  }
})

// 组件卸载前清理事件监听器
onUnmounted(() => {
  const editor = quillEditor.value?.getQuill()
  if (editor && textChangeHandler) {
    editor.off('text-change', textChangeHandler)
  }
})
</script>

<style scoped>
.quill-editor-container {
  text-align: left;
}

.quill-editor-container :deep(.ql-toolbar) {
  border-radius: 8px 8px 0 0;
  border-color: #dcdfe6;
}

.quill-editor-container :deep(.ql-container) {
  border-radius: 0 0 8px 8px;
  border-color: #dcdfe6;
}

.quill-editor-container :deep(.ql-editor) {
  min-height: 200px;
}

/* 使用更友好的代码高亮样式，避免黑色背景 */
.quill-editor-container :deep(.ql-syntax) {
  background-color: #f8f8f8;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 12px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px;
  line-height: 1.45;
  overflow: auto;
  color: #24292e;
}

/* 代码块内的内容样式 */
.quill-editor-container :deep(.ql-syntax code) {
  background: none;
  padding: 0;
}
</style>

