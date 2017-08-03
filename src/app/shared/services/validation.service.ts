import { Injectable }      from '@angular/core';


@Injectable()
export class ValidationService {
    static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
        let config = {
            'required': 'Required',
            'invalidPhoneNumber': 'Please only enter numbers',
            'invalidEmailAddress': 'Invalid email address',
            'invalidUrl': 'Invalid URL',
            'minlength': `Minimum length ${validatorValue.requiredLength}`
        };

        return config[validatorName];
    }

    static emailValidator(control) {
        // RFC 2822 compliant regex
        if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            return null;
        } else {
            return { 'invalidEmailAddress': true };
        }
    }

    static phoneValidator(control) {
        // RFC 2822 compliant regex
        if (control.value.match(/[0-9]/)) {
            return null;
        } else {
            return { 'invalidPhoneNumber': true };
        }
    }

    static urlValidator(control) {
        //RFC 3987 compliant regex
        if (control.value.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/)) {
            return null;
        } else {
            return {'invalidUrl': true };
        }
    }
}