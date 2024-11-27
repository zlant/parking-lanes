import { type OsmTags } from '../../../utils/types/osm-data'
import { type ParkingTagInfo } from '../../../utils/types/parking'
import { laneValues, orientationValues, reasonValues, restrictionValues } from './tag-values'

export const parkingLaneTags: ParkingTagInfo[] = [
    {
        template: 'parking:{side}',
        values: laneValues,
        checkForNeedShowing: (tags: OsmTags, side: string) => true,
        dependentTags: [
            'parking:{side}:reason',
            'parking:{side}:orientation',
            'parking:{side}:surface',
        ],
    },
    {
        template: 'parking:{side}:reason',
        values: reasonValues,
        checkForNeedShowing: (tags: OsmTags, side: string) => tags[`parking:${side}`] === 'no',
    },
    {
        template: 'parking:{side}:orientation',
        values: orientationValues,
        checkForNeedShowing: (tags: OsmTags, side: string) =>
            ['lane', 'street_side', 'on_kerb', 'half_on_kerb', 'shoulder'].includes(tags[`parking:${side}`]),
    },
    {
        template: 'parking:{side}:surface',
        checkForNeedShowing: (tags: OsmTags, side: string) =>
            ['lane', 'street_side', 'on_kerb', 'half_on_kerb', 'shoulder', 'yes'].includes(tags[`parking:${side}`]),
    },
    {
        template: 'parking:{side}:fee',
        values: [{ value: 'yes' }, { value: 'no' }],
        checkForNeedShowing: (tags: OsmTags, side: string) => true,
        dependentTags: [
            'parking:{side}:fee:conditional',
        ],
    },
    {
        template: 'parking:{side}:fee:conditional',
        values: [{ value: 'yes' }, { value: 'no' }],
        checkForNeedShowing: (tags: OsmTags, side: string) => true,
    },
    {
        template: 'parking:{side}:maxstay',
        checkForNeedShowing: (tags: OsmTags, side: string) => true,
        dependentTags: [
            'parking:{side}:maxstay:conditional',
        ],
    },
    {
        template: 'parking:{side}:maxstay:conditional',
        checkForNeedShowing: (tags: OsmTags, side: string) => true,
    },
    {
        template: 'parking:{side}:access',
        checkForNeedShowing: (tags: OsmTags, side: string) => true,
        dependentTags: [
            'parking:{side}:access:conditional',
        ],
    },
    {
        template: 'parking:{side}:access:conditional',
        checkForNeedShowing: (tags: OsmTags, side: string) => true,
    },
    {
        template: 'parking:{side}:restriction',
        values: restrictionValues,
        checkForNeedShowing: (tags: OsmTags, side: string) => true,
        dependentTags: [
            'parking:{side}:restriction:conditional',
            'parking:{side}:restriction:reason',
        ],
    },
    {
        template: 'parking:{side}:restriction:conditional',
        values: restrictionValues,
        checkForNeedShowing: (tags: OsmTags, side: string) => true,
    },
    {
        template: 'parking:{side}:restriction:reason',
        values: reasonValues,
        checkForNeedShowing: (tags: OsmTags, side: string) => !!tags[`parking:${side}:restriction`],
    },
]
