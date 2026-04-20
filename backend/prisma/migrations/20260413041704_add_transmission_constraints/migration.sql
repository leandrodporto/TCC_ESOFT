ALTER TABLE "VotingPlace"
ADD CONSTRAINT "vp_transmission_route_check"
CHECK (
  -- Se for TP → não precisa destino
  ("isTransmissionPoint" = true AND 
    "transmitToVotingPlaceId" IS NULL AND 
    "transmitToNotaryOfficeId" IS NULL)

  OR

  -- Se NÃO for TP → precisa exatamente um destino
  ("isTransmissionPoint" = false AND (
      ("transmitToVotingPlaceId" IS NOT NULL AND "transmitToNotaryOfficeId" IS NULL)
      OR
      ("transmitToVotingPlaceId" IS NULL AND "transmitToNotaryOfficeId" IS NOT NULL)
  ))
);

ALTER TABLE "VotingPlace"
ADD CONSTRAINT "vp_no_self_reference"
CHECK (
  "transmitToVotingPlaceId" IS NULL OR "transmitToVotingPlaceId" <> id
);