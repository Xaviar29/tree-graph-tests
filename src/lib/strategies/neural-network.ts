export class NeuralNetwork {
  w1: number[][]
  b1: number[]
  w2: number[][]
  b2: number[]
  w3: number[][]
  b3: number[]

  constructor(inputSize: number, hiddenSize: number, outputSize: number) {
    this.w1 = Array.from({ length: inputSize }, () =>
      Array.from({ length: hiddenSize }, () => (Math.random() - 0.5) * Math.sqrt(2 / inputSize)))
    this.b1 = new Array(hiddenSize).fill(0)
    this.w2 = Array.from({ length: hiddenSize }, () =>
      Array.from({ length: hiddenSize }, () => (Math.random() - 0.5) * Math.sqrt(2 / hiddenSize)))
    this.b2 = new Array(hiddenSize).fill(0)
    this.w3 = Array.from({ length: hiddenSize }, () =>
      Array.from({ length: outputSize }, () => (Math.random() - 0.5) * Math.sqrt(2 / hiddenSize)))
    this.b3 = new Array(outputSize).fill(0)
  }

  forward(input: number[]): number[] {
    const h1 = this.w1[0].map((_, j) => {
      let sum = this.b1[j]
      for (let i = 0; i < input.length; i++) sum += this.w1[i][j] * input[i]
      return Math.max(0, sum)
    })
    const h2 = this.w2[0].map((_, j) => {
      let sum = this.b2[j]
      for (let i = 0; i < h1.length; i++) sum += this.w2[i][j] * h1[i]
      return Math.max(0, sum)
    })
    const output = this.w3[0].map((_, j) => {
      let sum = this.b3[j]
      for (let i = 0; i < h2.length; i++) sum += this.w3[i][j] * h2[i]
      return sum
    })
    return output
  }

  trainBatch(inputs: number[][], targets: number[][], learningRate: number): void {
    const batchSize = inputs.length
    const hiddenSize1 = this.b1.length
    const hiddenSize2 = this.b2.length
    const outputSize = this.b3.length
    const inputSize = this.w1.length

    let gradW1: number[][] = Array.from({ length: inputSize }, () => new Array(hiddenSize1).fill(0))
    let gradB1: number[] = new Array(hiddenSize1).fill(0)
    let gradW2: number[][] = Array.from({ length: hiddenSize1 }, () => new Array(hiddenSize2).fill(0))
    let gradB2: number[] = new Array(hiddenSize2).fill(0)
    let gradW3: number[][] = Array.from({ length: hiddenSize2 }, () => new Array(outputSize).fill(0))
    let gradB3: number[] = new Array(outputSize).fill(0)

    for (let b = 0; b < batchSize; b++) {
      const input = inputs[b]
      const target = targets[b]

      const z1: number[] = new Array(hiddenSize1)
      const a1: number[] = new Array(hiddenSize1)
      for (let j = 0; j < hiddenSize1; j++) {
        let sum = this.b1[j]
        for (let i = 0; i < inputSize; i++) sum += this.w1[i][j] * input[i]
        z1[j] = sum
        a1[j] = Math.max(0, sum)
      }

      const z2: number[] = new Array(hiddenSize2)
      const a2: number[] = new Array(hiddenSize2)
      for (let j = 0; j < hiddenSize2; j++) {
        let sum = this.b2[j]
        for (let i = 0; i < hiddenSize1; i++) sum += this.w2[i][j] * a1[i]
        z2[j] = sum
        a2[j] = Math.max(0, sum)
      }

      const output: number[] = new Array(outputSize)
      for (let j = 0; j < outputSize; j++) {
        let sum = this.b3[j]
        for (let i = 0; i < hiddenSize2; i++) sum += this.w3[i][j] * a2[i]
        output[j] = sum
      }

      const dOut: number[] = new Array(outputSize)
      for (let j = 0; j < outputSize; j++) dOut[j] = output[j] - target[j]

      for (let i = 0; i < hiddenSize2; i++) {
        for (let j = 0; j < outputSize; j++) {
          gradW3[i][j] += dOut[j] * a2[i]
        }
      }
      for (let j = 0; j < outputSize; j++) gradB3[j] += dOut[j]

      const dH2: number[] = new Array(hiddenSize2)
      for (let i = 0; i < hiddenSize2; i++) {
        let sum = 0
        for (let j = 0; j < outputSize; j++) sum += this.w3[i][j] * dOut[j]
        dH2[i] = sum * (z2[i] > 0 ? 1 : 0)
      }

      for (let i = 0; i < hiddenSize1; i++) {
        for (let j = 0; j < hiddenSize2; j++) {
          gradW2[i][j] += dH2[j] * a1[i]
        }
      }
      for (let j = 0; j < hiddenSize2; j++) gradB2[j] += dH2[j]

      const dH1: number[] = new Array(hiddenSize1)
      for (let i = 0; i < hiddenSize1; i++) {
        let sum = 0
        for (let j = 0; j < hiddenSize2; j++) sum += this.w2[i][j] * dH2[j]
        dH1[i] = sum * (z1[i] > 0 ? 1 : 0)
      }

      for (let i = 0; i < inputSize; i++) {
        for (let j = 0; j < hiddenSize1; j++) {
          gradW1[i][j] += dH1[j] * input[i]
        }
      }
      for (let j = 0; j < hiddenSize1; j++) gradB1[j] += dH1[j]
    }

    const scale = learningRate / batchSize
    for (let i = 0; i < inputSize; i++)
      for (let j = 0; j < hiddenSize1; j++)
        this.w1[i][j] -= scale * gradW1[i][j]
    for (let j = 0; j < hiddenSize1; j++)
      this.b1[j] -= scale * gradB1[j]

    for (let i = 0; i < hiddenSize1; i++)
      for (let j = 0; j < hiddenSize2; j++)
        this.w2[i][j] -= scale * gradW2[i][j]
    for (let j = 0; j < hiddenSize2; j++)
      this.b2[j] -= scale * gradB2[j]

    for (let i = 0; i < hiddenSize2; i++)
      for (let j = 0; j < outputSize; j++)
        this.w3[i][j] -= scale * gradW3[i][j]
    for (let j = 0; j < outputSize; j++)
      this.b3[j] -= scale * gradB3[j]
  }

  copy(): NeuralNetwork {
    const n = new NeuralNetwork(this.w1.length, this.w2.length, this.w3[0].length)
    n.w1 = this.w1.map(r => [...r])
    n.b1 = [...this.b1]
    n.w2 = this.w2.map(r => [...r])
    n.b2 = [...this.b2]
    n.w3 = this.w3.map(r => [...r])
    n.b3 = [...this.b3]
    return n
  }
}
