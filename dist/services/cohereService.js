"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendChatMessage = sendChatMessage;
const cohere_ai_1 = require("cohere-ai");
const config_1 = require("../config");
const cohere = new cohere_ai_1.CohereClientV2({
    token: config_1.config.cohereApiKey,
});
function sendChatMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield cohere.chat({
                model: 'command-r-plus',
                messages: [
                    {
                        role: 'user',
                        content: message,
                    },
                ],
            });
            return response;
        }
        catch (error) {
            console.error('Error sending chat message: ', error.message);
            throw error;
        }
    });
}
