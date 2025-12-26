import type { RequestContext } from "../contracts/context";

import type {
  GenerateObjectInput,
  GenerateObjectResult,
  GenerateTextInput,
  GenerateTextResult,
  LanguageModel,
  StreamObjectResult,
  StreamTextResult
} from "./language-model";

export type LanguageModelNext<TContext extends RequestContext> = {
  generateText: (ctx: TContext, input: GenerateTextInput) => Promise<GenerateTextResult>;
  generateObject: <T>(ctx: TContext, input: GenerateObjectInput<T>) => Promise<GenerateObjectResult<T>>;
  streamText?: (ctx: TContext, input: GenerateTextInput) => StreamTextResult;
  streamObject?: <T>(ctx: TContext, input: GenerateObjectInput<T>) => StreamObjectResult;
};

export type LanguageModelMiddleware<TContext extends RequestContext> = {
  name: string;
  enabled?: (ctx: TContext) => boolean;
  generateText?: (ctx: TContext, input: GenerateTextInput, next: LanguageModelNext<TContext>["generateText"]) => Promise<GenerateTextResult>;
  generateObject?: <T>(
    ctx: TContext,
    input: GenerateObjectInput<T>,
    next: LanguageModelNext<TContext>["generateObject"]
  ) => Promise<GenerateObjectResult<T>>;
  streamText?: (
    ctx: TContext,
    input: GenerateTextInput,
    next: NonNullable<LanguageModelNext<TContext>["streamText"]>
  ) => StreamTextResult;
  streamObject?: <T>(
    ctx: TContext,
    input: GenerateObjectInput<T>,
    next: NonNullable<LanguageModelNext<TContext>["streamObject"]>
  ) => StreamObjectResult;
};

const isEnabled = <TContext extends RequestContext>(mw: LanguageModelMiddleware<TContext>, ctx: TContext): boolean => {
  if (mw.enabled === undefined) {
    return true;
  }
  return mw.enabled(ctx);
};

export const wrapLanguageModel = <TContext extends RequestContext>(
  base: LanguageModel<TContext>,
  middlewares: readonly LanguageModelMiddleware<TContext>[]
): LanguageModel<TContext> => {
  const buildGenerateText = (): LanguageModel<TContext>["generateText"] => {
    const baseFn: LanguageModelNext<TContext>["generateText"] = (ctx, input) => base.generateText(ctx, input);

    return middlewares.reduceRight<LanguageModelNext<TContext>["generateText"]>((next, mw) => {
      return async (ctx, input) => {
        if (!isEnabled(mw, ctx) || mw.generateText === undefined) {
          return next(ctx, input);
        }
        return mw.generateText(ctx, input, next);
      };
    }, baseFn);
  };

  const buildGenerateObject = (): LanguageModel<TContext>["generateObject"] => {
    const baseFn: LanguageModelNext<TContext>["generateObject"] = (ctx, input) => base.generateObject(ctx, input);

    return middlewares.reduceRight<LanguageModelNext<TContext>["generateObject"]>((next, mw) => {
      return async <T>(ctx: TContext, input: GenerateObjectInput<T>) => {
        if (!isEnabled(mw, ctx) || mw.generateObject === undefined) {
          return next(ctx, input);
        }
        return mw.generateObject<T>(ctx, input, next);
      };
    }, baseFn);
  };

  const buildStreamText = (): LanguageModel<TContext>["streamText"] => {
    const baseStreamText = base.streamText;
    if (baseStreamText === undefined) {
      return undefined;
    }

    const baseFn: NonNullable<LanguageModelNext<TContext>["streamText"]> = (ctx, input) => baseStreamText(ctx, input);

    return middlewares.reduceRight<NonNullable<LanguageModelNext<TContext>["streamText"]>>((next, mw) => {
      return (ctx, input) => {
        if (!isEnabled(mw, ctx) || mw.streamText === undefined) {
          return next(ctx, input);
        }

        return mw.streamText(ctx, input, next);
      };
    }, baseFn);
  };

  const buildStreamObject = (): LanguageModel<TContext>["streamObject"] => {
    const baseStreamObject = base.streamObject;
    if (baseStreamObject === undefined) {
      return undefined;
    }

    const baseFn: NonNullable<LanguageModelNext<TContext>["streamObject"]> = (ctx, input) => baseStreamObject(ctx, input);

    return middlewares.reduceRight<NonNullable<LanguageModelNext<TContext>["streamObject"]>>((next, mw) => {
      return <T>(ctx: TContext, input: GenerateObjectInput<T>) => {
        if (!isEnabled(mw, ctx) || mw.streamObject === undefined) {
          return next(ctx, input);
        }

        return mw.streamObject<T>(ctx, input, next);
      };
    }, baseFn);
  };

  const streamText = buildStreamText();
  const streamObject = buildStreamObject();

  return {
    generateText: buildGenerateText(),
    generateObject: buildGenerateObject(),
    ...(streamText !== undefined ? { streamText } : {}),
    ...(streamObject !== undefined ? { streamObject } : {})
  };
};
