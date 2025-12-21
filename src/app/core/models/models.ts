
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  clientId?: number;
}

export interface Client {
  id: number;
  nom: string;
  email: string;
}

export interface CompteBancaire {
  id: number;
  dateCreation: Date;
  solde: number;
  statut: 'CREATED' | 'ACTIVATED' | 'SUSPENDED';
  devise: string;
  typeCompte: string;
  clientId: number;
  clientNom: string;
  decouvert?: number;
  tauxInteret?: number;
}

export interface Operation {
  id: number;
  dateOp: Date;
  montant: number;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  compteId: number;
  createdBy: string;
}

export interface VersementDTO {
  compteId: number;
  montant: number;
  description: string;
}

export interface RetraitDTO {
  compteId: number;
  montant: number;
  description: string;
}

export interface VirementDTO {
  compteSource: number;
  compteDestination: number;
  montant: number;
  description: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  enabled: boolean;
  client?: Client;
}
