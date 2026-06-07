/** Admin AI Code Generator types */

export const CODE_GENERATION_COST = 1

export type CodeFramework =
  | 'React'
  | 'Next.js'
  | 'HTML/CSS'
  | 'Tailwind'
  | 'Node.js'
  | 'Supabase'

export type CodeOutputType =
  | 'Component'
  | 'Full Page'
  | 'API Route'
  | 'Database Schema'
  | 'Landing Page'

export const CODE_FRAMEWORK_OPTIONS: { value: CodeFramework; label: string }[] = [
  { value: 'React', label: 'React' },
  { value: 'Next.js', label: 'Next.js' },
  { value: 'HTML/CSS', label: 'HTML/CSS' },
  { value: 'Tailwind', label: 'Tailwind' },
  { value: 'Node.js', label: 'Node.js' },
  { value: 'Supabase', label: 'Supabase' },
]

export const CODE_OUTPUT_TYPE_OPTIONS: { value: CodeOutputType; label: string }[] = [
  { value: 'Component', label: 'Component' },
  { value: 'Full Page', label: 'Full Page' },
  { value: 'API Route', label: 'API Route' },
  { value: 'Database Schema', label: 'Database Schema' },
  { value: 'Landing Page', label: 'Landing Page' },
]

export type CodeGenerationRequest = {
  projectDescription: string
  framework: CodeFramework
  outputType: CodeOutputType
}

export type GeneratedCodeRow = {
  id: string
  user_id: string
  project_description: string
  framework: string
  output_type: string
  code_content: string
  language: string
  created_at: string
}

export type CodeGeneration = {
  id: string
  projectDescription: string
  framework: CodeFramework | string
  outputType: CodeOutputType | string
  code: string
  language: string
  createdAt: string
}

export type CodeGenerationResult = {
  generation: CodeGeneration
  summary?: string
}

export const GENERATED_CODE_ROW_SELECT =
  'id, user_id, project_description, framework, output_type, code_content, language, created_at'
