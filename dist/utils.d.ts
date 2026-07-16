import { ReactNode } from "react";
import { SectionType, CardType, CardProps, ElementProps, FormInput, Mods, CardComponentType, DataOptions, DataType, AddFormObjectParametersType, DefinitionData, InputSelectDataType } from "./types";
export declare function parse(text: string): any;
export declare function stringify(obj: any): string;
export declare function defaultDataProps(category: string, allFormInputs: {
    [key: string]: FormInput;
}): InputSelectDataType;
export declare function defaultUiProps(category: string, allFormInputs: {
    [key: string]: FormInput;
}): InputSelectDataType;
export declare function categoryType(category: string, allFormInputs: {
    [key: string]: FormInput;
}): DataType;
export declare function getCardBody(category: string, allFormInputs: {
    [key: string]: FormInput;
}): CardComponentType;
export declare function categoryToNameMap(allFormInputs: {
    [key: string]: FormInput;
}): {
    [key: string]: string;
};
export declare function generateCategoryHash(allFormInputs: {
    [key: string]: FormInput;
}): {
    [key: string]: any;
};
export declare function getCardCategory(cardProps: CardProps, categoryHash: {
    [key: string]: string;
}): string;
export declare function checkForUnsupportedFeatures(schema: {
    [key: string]: any;
}, uischema: {
    [key: string]: any;
}, allFormInputs: {
    [key: string]: FormInput;
}): string[];
export declare function generateElementPropsFromSchemas(parameters: {
    schema: {
        [key: string]: any;
    };
    uischema: {
        [key: string]: any;
    };
    definitionData?: DefinitionData;
    definitionUi?: {
        [key: string]: any;
    };
    categoryHash: {
        [key: string]: string;
    };
}): ElementProps[];
export declare function countElementsFromSchema(schemaData: any): number;
export declare function generateSchemaFromElementProps(elementArr: ElementProps[]): {
    [key: string]: any;
    definitions?: {
        [key: string]: any;
    };
};
export declare function generateUiSchemaFromElementProps(elementArr: Array<ElementProps>, definitionUi: any): {
    [key: string]: any;
    definitions?: {
        [key: string]: any;
    };
};
export declare function getCardParameterInputComponentForType(category: string, allFormInputs: {
    [key: string]: FormInput;
}): CardComponentType;
export declare function updateSchemas(elementArr: ElementProps[], parameters: {
    schema: {
        [key: string]: any;
        definitions?: {
            [key: string]: any;
        };
    };
    uischema: {
        [key: string]: any;
        definitions?: {
            [key: string]: any;
        };
    };
    onChange: (schema: {
        [key: string]: any;
    }, uischema: {
        [key: string]: any;
    }) => any;
    definitionData?: {
        [key: string]: any;
    };
    definitionUi?: {
        [key: string]: any;
    };
}): void;
export declare const DEFAULT_INPUT_NAME = "newInput";
export declare function addCardObj(parameters: AddFormObjectParametersType): void;
export declare function addSectionObj(parameters: AddFormObjectParametersType): void;
export declare function generateElementComponentsFromSchemas(parameters: {
    schemaData: {
        [key: string]: any;
    };
    uiSchemaData: {
        [key: string]: any;
    };
    onChange: (schema: {
        [key: string]: any;
    }, uischema: {
        [key: string]: any;
    }) => any;
    definitionData?: {
        [key: string]: any;
    };
    definitionUi?: {
        [key: string]: any;
    };
    hideKey?: boolean;
    path: string;
    cardOpenState: Record<string, boolean>;
    setCardOpenState: (newState: Record<string, boolean>) => void;
    allFormInputs: {
        [key: string]: FormInput;
    };
    mods?: Mods;
    categoryHash: {
        [key: string]: string;
    };
    Card: CardType;
    Section: SectionType;
}): ReactNode[];
export declare function onDragEnd(result: any, details: {
    schema: {
        [key: string]: any;
    };
    uischema: {
        [key: string]: any;
    };
    onChange: (schema: {
        [key: string]: any;
    }, uischema: {
        [key: string]: any;
    }) => any;
    definitionData?: {
        [key: string]: any;
    };
    definitionUi?: {
        [key: string]: any;
    };
    categoryHash: {
        [key: string]: string;
    };
}): void;
export declare function propagateDefinitionChanges(schema: {
    [key: string]: any;
}, uischema: {
    [key: string]: any;
}, onChange: (schema: {
    [key: string]: any;
}, uischema: {
    [key: string]: any;
}) => void, categoryHash: {
    [key: string]: string;
}): void;
export declare function subtractArray(array1: string[], array2?: string[]): string[];
export declare function excludeKeys(obj: {
    [key: string]: any;
}, keys?: string[] | null): {};
export declare function getNewElementDefaultDataOptions(i: number, mods?: Mods): DataOptions;
export declare function getRandomId(): string;
export declare const DROPPABLE_TYPE = "rjsfb";
//# sourceMappingURL=utils.d.ts.map