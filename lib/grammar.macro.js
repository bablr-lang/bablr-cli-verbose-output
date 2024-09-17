import { i } from '@bablr/boot';
import { CoveredBy, Node, InjectFrom } from '@bablr/helpers/decorators';
import * as productions from '@bablr/helpers/productions';
import * as CSTML from '@bablr/language-en-cstml';
import * as CSTMLInstruction from '@bablr/language-en-bablr-vm-instruction/cstml';
import * as SpamexInstruction from '@bablr/language-en-bablr-vm-instruction/spamex';
import * as Space from '@bablr/language-en-blank-space';

export const dependencies = { Space, CSTML, CSTMLInstruction, SpamexInstruction };

export const canonicalURL = 'https://bablr.org/languages/core/en/bablr-cli-verbose-output';

export function* eatMatchTrivia() {
  if (yield i`match(/[ \t\n]/)`) {
    return yield i`eat(<#*Space:Space />)`;
  }
  return null;
}

export const grammar = class VerboseOutputGrammar {
  @Node
  *Output() {
    while ((yield i`match(/./)`) && (yield i`eat(<Line /> 'lines[]')`));
  }

  *Line() {
    yield i`eat(<Any /> null [
      <ExecSpamexInstructionLine '>>>' />
      <ExecCSTMLInstructionLine '    >>>' />
      <EmitLine '<<<' />
      <EnterProductionLine '-->' />
      <LeaveProductionLine /[x<]--/ />
      <OutputLine />
    ])`;
  }

  @Node
  *ProductionName() {
    yield i`eatMatch(<~*Punctuator '[' /> 'openBrace')`;
    yield i`eat(<*Identifier /> 'productionName')`;
    yield i`eatMatch(<~*Punctuator ']' /> 'closeBrace')`;
  }

  @CoveredBy('Line')
  @Node
  *EnterProductionLine() {
    yield i`eat(<~*Punctuator '-->' /> 'sigilToken')`;
    yield* eatMatchTrivia();
    yield i`eat(<ProductionName />)`;
    yield i`eat(<~*Punctuator '\n' /> 'lineTerminatorToken')`;
  }

  @CoveredBy('Line')
  @Node
  *LeaveProductionLine() {
    yield i`eat(<~*Punctuator /[<x]--/ /> 'sigilToken')`;
    yield* eatMatchTrivia();
    yield i`eat(<ProductionName />)`;
    yield i`eat(<~*Punctuator '\n' /> 'lineTerminatorToken')`;
  }

  @CoveredBy('Line')
  @Node
  *EmitLine() {
    yield i`eat(<~*Punctuator '<<<' /> 'sigilToken')`;
    yield* eatMatchTrivia();
    yield i`eat(<CSTML:Token /> 'expression')`;
    yield i`eat(<~*Punctuator '\n' /> 'lineTerminatorToken')`;
  }

  @CoveredBy('Line')
  @Node
  *ExecCSTMLInstructionLine() {
    yield i`eat(<~*Punctuator '    >>>' /> 'sigilToken')`;
    yield* eatMatchTrivia();
    yield i`eat(<CSTMLInstruction:Call /> 'instruction')`;
    yield i`eat(<~*Punctuator '\n' /> 'lineTerminatorToken')`;
  }

  @CoveredBy('Line')
  @Node
  *ExecSpamexInstructionLine() {
    yield i`eat(<~*Punctuator '>>>' /> 'sigilToken')`;
    yield* eatMatchTrivia();
    yield i`eat(<SpamexInstruction:Call /> 'instruction')`;
    yield i`eat(<~*Punctuator '\n' /> 'lineTerminatorToken')`;
  }

  @CoveredBy('Line')
  @Node
  *OutputLine() {
    yield* eatMatchTrivia();
    yield i`eat(<CSTML:Tag /> 'expression')`;
    yield i`eat(<~*Punctuator '\n' /> 'lineTerminatorToken')`;
  }

  @Node
  *Identifier() {
    yield i`eat(/[a-zA-Z]+/)`;
  }

  @Node
  @InjectFrom(productions)
  *Punctuator() {}

  @InjectFrom(productions)
  *Any() {}
};
