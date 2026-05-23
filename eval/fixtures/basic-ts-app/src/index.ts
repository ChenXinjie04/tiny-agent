const args = process.argv.slice(2)

export const COMMAND_RISK_RULES: Record<string, "low" | "medium" | "high"> = {
  pwd: "low",
  ls: "low",
  npm: "medium",
}


export function main(argv: string[]): string {
  if (argv.includes("--version")) {
    return "basic-ts-app 1.0.0";
  }

  return "ready";
}

console.log(main(args))
