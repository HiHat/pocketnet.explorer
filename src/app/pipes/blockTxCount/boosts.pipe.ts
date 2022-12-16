import { Pipe, PipeTransform } from '@angular/core';
import { BlockCompact } from 'src/app/types/Block';
import { Types } from 'src/app/types/Transaction';

@Pipe({
    name: 'BoostCnt'
})
export class BoostCntPipe implements PipeTransform {

    transform(block: BlockCompact, args?: any): number {
        return (block.types[Types.BoostContent]||0) || 0;
    }

}
