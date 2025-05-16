import { Student } from "./Student"

export interface Group {
    id: string
    name: string
    students: Student[] | null
}