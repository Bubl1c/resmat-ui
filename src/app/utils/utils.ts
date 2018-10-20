
export namespace RMU {

  export function safe(toExecuteSafely: () => void): void {
    try {
      toExecuteSafely()
    } catch(e) {
      console.error("Failed to execute block of code safely", e)
    }
  }

}
