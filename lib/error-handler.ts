export function handleAdminError(component: string, error: any): void {
  console.error(`Error in ${component}:`, error)

  // You could add additional error reporting here, like sending to a service
}

/**
 * Safe access to nested properties
 * @param obj The object to access
 * @param path The path to the property, e.g. "user.name"
 * @param defaultValue The default value to return if the property doesn't exist
 */
export function safeAccess(obj: any, path: string, defaultValue: any = null): any {
  try {
    const keys = path.split(".")
    let result = obj

    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue
      }
      result = result[key]
    }

    return result === undefined ? defaultValue : result
  } catch (error) {
    console.error(`Error accessing ${path}:`, error)
    return defaultValue
  }
}

/**
 * Safely process data with a fallback for errors
 * @param data The data to process
 * @param processor The function to process the data
 * @param defaultValue The default value to return if processing fails
 */
export function safeProcess<T, R>(data: T, processor: (data: T) => R, defaultValue: R): R {
  try {
    return processor(data)
  } catch (error) {
    console.error("Error processing data:", error)
    return defaultValue
  }
}
