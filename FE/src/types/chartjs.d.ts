interface ChartConfiguration {
  type: string
  data: {
    labels?: string[]
    datasets: Array<{
      label?: string
      data: number[]
      backgroundColor?: string | string[]
      borderColor?: string | string[]
      borderWidth?: number
      borderDash?: number[]
      fill?: boolean
      tension?: number
      pointRadius?: number
      pointBackgroundColor?: string
      pointBorderColor?: string
      borderRadius?: number
      borderSkipped?: boolean
      spacing?: number
      cutout?: string
    }>
  }
  options?: Record<string, unknown>
}

interface ChartConstructor {
  new (ctx: CanvasRenderingContext2D | string, config: ChartConfiguration): ChartInstance
  register(...items: unknown[]): void
}

interface ChartInstance {
  destroy(): void
  update(): void
  resize(): void
}

interface ChartStatic {
  readonly Chart: ChartConstructor
  readonly DoughnutController: unknown
  readonly ArcElement: unknown
  readonly BarController: unknown
  readonly BarElement: unknown
  readonly LineController: unknown
  readonly LineElement: unknown
  readonly PointElement: unknown
  readonly LinearScale: unknown
  readonly CategoryScale: unknown
  readonly Tooltip: unknown
  readonly Legend: unknown
  readonly Filler: unknown
}

interface Window {
  Chart: ChartConstructor
}