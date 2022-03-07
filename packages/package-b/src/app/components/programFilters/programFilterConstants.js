export const errorDetectionDefinitions = [
  {
    type: 'missingProgramTitle',
    feName: 'Missing Program Association',
    shortName: 'Missing name/title on listing',
    longName: 'Missing name/title on listing. In DPP, the `name` field comes from `item.name`. In MPX, the field comes from `program.title`.',
  },
  {
    type: 'missingRating',
    feName: 'Missing Rating',
    shortName: 'Missing content rating on listing',
    longName:
      'Missing contentRating on listing. In DPP, the `contentRating` field comes from `item.contentRating`. In MPX, it comes from `listing.pllisting$contentRatings.0.pllisting$rating` or `program.`plprogram$ratings.0.plprogram$rating`.',
  },
  {
    type: 'missingDescription',
    feName: 'Missing Description',
    shortName: 'Missing description on listing',
    longName: 'Missing description on listing. In DPP, the `description` field comes from `item.description`. In MPX, it comes from `program.description`.',
  },
  {
    type: 'missingNetwork',
    feName: 'Missing Network',
    shortName: 'Missing network on listing',
    longName: 'Missing network on listing. In DPP, the `network` field comes from `item.network`. In MPX, it comes from `program.fox$network.0`.',
  },
  {
    type: 'missingImages',
    feName: 'Missing Images',
    shortName: 'Missing images on listing',
    longName:
      'Missing images on listing. In DPP, the `images` field is built from `item.images/videoList` and `item.images.still`. In MPX, it is build from `program/plprogram$thumbnails`.',
  },
  {
    type: 'missingDuration',
    feName: 'Missing Duration',
    shortName: 'Missing duration on listing',
    longName:
      'Missing duration on listing. In DPP, the `durationInSeconds` field comes from `item.durationInSeconds`. In MPX, it comes from `program.plprogram$runtime`.',
  },
  {
    type: 'missingSeason',
    feName: 'Missing Season #',
    shortName: 'Missing season on listing',
    longName:
      'Missing season on listing. In DPP, the `seasonNumber` field comes from `item.seasonNumber`. In MPX, it comes from `program.plprogram$tvSeasonNumber`.',
  },
  {
    type: 'missingEpisode',
    feName: 'Missing Episode #',
    shortName: 'Missing episode number on listing',
    longName:
      'Missing episode number on listing. In DPP, the `episodeNumber` field comes from `item.episodeNumber`. In MPX, it comes from `program.plprogram$tvSeasonEpisodeNumber`.',
  },
  {
    type: 'missingSportTag',
    feName: 'Missing Sport Tag',
    shortName: 'Missing sport tag on listing',
    longName: 'Missing sport tag on listing. In DPP, the `sportTag` field comes from `item.sportTag`. In MPX, it comes from `program.fox$sportTag`.',
  },
  {
    type: 'missingAiringType',
    feName: 'Missing Airing Type',
    shortName: 'Missing airing type on listing',
    longName: 'Missing airing type on listing. In DPP, the `airingType` field is unpopulated. In MPX, it comes from `listing.pllisting$airingType`.',
  },
  {
    type: 'missingBroadcastIdAndMaterialIds',
    feName: 'Missing MaterialIds',
    shortName: 'Missing materialId in listing',
    longName: 'Missing materialId in listing. In DPP, the `materialiIds` field comes from `item.materialIDs`. In MPX, it comes from `program.fox$materialIds`.',
  },
  {
    type: 'overlap',
    feName: 'Overlapping Listings',
    shortName: 'Overlapping listing',
    longName: 'Overlapping listing.',
  },
  {
    type: 'gap',
    feName: 'Missing Listing',
    shortName: 'Gap in listing schedule',
    longName: 'Gap in listing schedule.',
  },
  {
    type: 'materialIdConflict',
    feName: 'Material Id Conflict',
    shortName: 'Not currently supported',
    longName: 'Not currently supported.',
  },
  {
    type: 'rightsMismatch',
    feName: 'Rights Mismatch',
    shortName: 'Rights mismatch',
    longName: 'Rights mismatch. A conflict between the fields `streamingAllowed` and `restartEnabled`.',
  },
  {
    type: 'unexpectedPrimetime',
    feName: 'Unexpected Primetime Flag',
    shortName: "isPrimetime in listing doesn't match network status",
    longName: "The listing's start either inside or outside of a defined primetime network block doesn't match its `isPrimetime` setting.",
  },
  {
    type: 'unexpectedNetwork',
    feName: 'Unexpected Network Flag',
    shortName: "isNetwork in listing doesn't match network status",
    longName: "The listing's start either inside or outside of a defined network block doesn't match its `isNetwork` setting.",
  },
  {
    type: 'excessMaterialIds',
    feName: 'Accumulating Material IDs',
    shortName: 'Too many material ids in listing',
    longName: 'Too many material ids in listing. The size of the `materialiIds` array exceeds 25.',
  },
  {
    type: 'badVdmsExternalId',
    feName: 'Bad VDMS External ID',
    shortName: 'Listing vdmsExternalId is either empty or not included in materialIds',
    longName: "The listing's `vdmsExternalId` value is either empty or not included in its `materialIds` array.",
  },
  {
    type: 'tba',
    feName: 'To Be Announced',
    shortName: 'Listing title is "To Be Announced" or listing has a poisonous materialId',
    longName:
      'The listing is scheduled to air soon (within 3 days)  and the name` field has the words "to be announced" or the materialIds array contains one of the following: "SH000191680000", "20180328".  n DPP, the `name` field comes from `item.name`. In MPX, the field comes from `program.title`.',
  },
  {
    type: 'unexpectedEvergreen',
    feName: 'Unexpected Evergreen',
    shortName: 'listing.isEvergreen is not as expected',
    longName:
      'The listing\'s materialId\'s contain one of the following: "FOX-SOUL" or "newshour" and `isEvergreen` is false. In DPP, the `isEvergreen` field comes from `item.isEvergreen`. In MPX, it is unpopulated.',
  },
  {
    type: 'expiringEvergreen',
    feName: 'Expiring Evergreen',
    shortName: 'Listing is evergreen but will air soon',
    longName: `"name", populated in DPP from "item.name", in MPX from "listing.title"<br><br>
        "seriesName", populated in DPP from "item.seriesName", unpopulated in MPX<br><br>
        "description", populated in DPP from "item.description", in MPX from "program.description"<br><br>
        "secondaryTitle", populated in DPP from "item.secondaryTitle", in MPX from "program.plprogram$secondaryTitle"<br><br>
        "shortDescription", populated in DPP from "item.shortDescription", in MPX from "program.plprogram$shortDescription"<br><br>
        "longDescription", populate din DPP from "item.longDescription", in MPX from "program.plprogram$longDescription"<br><br>
        "shortTitle", populated in DPP from "item.shortTitle", in MPX from "program.plprogram$shortTitle"<br><br>
        "longTitle", populated in DPP from "item.longTitle, in MPX from "program.plprogram$longTitle"
        `,
  },
  {
    type: 'badCharacters',
    feName: 'Bad Characters',
    shortName: 'Bad chacracters in some listing fields',
    longName: 'The listing contains one of a list of admin-managed "bad characters" in any of the following fields:',
  },
]
