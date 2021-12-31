import {
  BaseSource,
  Candidate,
} from "https://deno.land/x/ddc_vim@v1.2.0/types.ts#^";
import {
  GatherCandidatesArguments,
} from "https://deno.land/x/ddc_vim@v1.2.0/base/source.ts#^";

type Params = {
  command: string[];
};

export class Source extends BaseSource<Params> {
  private readCount: number | null = null;
  private wordSet: Set<string> | null = null;

  async gatherCandidates(
    { sourceParams }: GatherCandidatesArguments<Params>,
  ): Promise<Candidate[]> {
    const histories = await this.getHistory(sourceParams.command);
    return this.allWords(histories).map((word) => ({ word }));
  }

  params(): Params {
    return {
      command: [Deno.env.get("SHELL") || "sh", "-c", "history"],
    };
  }

  private async runCmd(cmd: string[]): Promise<string[]> {
    const p = Deno.run({ cmd, stdout: "piped" });
    const [_, out] = await Promise.all([p.status(), p.output()]);
    p.close();
    return new TextDecoder().decode(out).split(/\n/);
  }

  private async getHistory(command: string[]): Promise<string[]> {
    const lines = await this.runCmd(command);
    const histories = lines.map((line) => line.replace(/^\d+\s+/, ""));
    if (this.readCount === null) {
      this.readCount = histories.length;
      return histories;
    } else if (histories.length > this.readCount) {
      const result = histories.slice(this.readCount);
      this.readCount = histories.length;
      return result;
    }
    return [];
  }

  private allWords(lines: string[]): string[] {
    const words = lines
      .flatMap((line) => [...line.matchAll(/[-_\p{L}\d]+/gu)])
      .map((match) => match[0]);
    if (this.wordSet) {
      for (const word of words) {
        this.wordSet.add(word);
      }
    } else {
      this.wordSet = new Set(words);
    }
    return Array.from(this.wordSet); // remove duplication
  }
}
